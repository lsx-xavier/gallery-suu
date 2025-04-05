import { driveWithAuth } from '@/config/apis/google';
import { redis } from '@/config/redis';
import { createSlug } from '@/utils/create-slug';
import JSZip from 'jszip';

type DownloadImagesProps = {
  foldersName: string[];
  photoId: string | undefined;
};

export async function downloadImages({ foldersName, photoId }: DownloadImagesProps) {
  const drive = await driveWithAuth();

  if (photoId) {
    const responsePhoto = await drive.files.get(
      {
        fileId: photoId,
        alt: 'media',
      },
      {
        responseType: 'stream',
      },
    );

    if (!responsePhoto) {
      throw {
        status: 404,
        message: 'Nenhuma imagem encontrada',
      };
    }

    return responsePhoto;
  } else {
    const targetFolderSlug = createSlug(foldersName[foldersName.length - 1]);
    const status = await redis.hgetall(`folder:${targetFolderSlug}`);

    if (!status) {
      throw {
        message: 'Folder not found on DB',
        status: 404,
      };
    }

    // Se photoId NÃO foi passado, baixa todos os arquivos da pasta
    const folderId = (status.webFolderId as string).length > 0 ? status.webFolderId : status.id;
    let nextPage: string | undefined | null = '';

    const zip = new JSZip();
    const fotosFolder = zip.folder(foldersName.join(' - ')); // Cria uma pasta dentro do ZIP

    while (nextPage !== undefined) {
      console.log({ nextPage });
      await drive.files
        .list({
          q: `'${folderId}' in parents and trashed = false`,
          fields: 'files(id, name, mimeType), nextPageToken',
          pageToken: nextPage.trim(),
        })
        .then(async (resp) => {
          if (!resp.data.files || resp.data.files.length === 0) {
            throw {
              status: 404,
              message: 'Nenhum arquivo encontrado na pasta',
            };
          }

          // Download em paralelo
          const downloads = await Promise.all(
            resp.data.files.map(async (file) => {
              const response = await drive.files.get(
                { fileId: file.id!, alt: 'media' },
                { responseType: 'arraybuffer' },
              );

              // Garante que o arquivo tenha extensão .jpg
              const fileName = file.name?.endsWith('.jpg') ? file.name : `${file.name}.jpg`;
              return { name: fileName, data: response.data };
            }),
          );

          // Adiciona arquivos ao ZIP dentro da pasta
          downloads.forEach(({ name, data }) => {
            fotosFolder?.file(name, data);
          });

          nextPage = resp.data.nextPageToken;
        });
    }

    // Gera o ZIP como um buffer
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 5, // nível de compressão moderado (1-9)
      },
    });

    return zipBuffer;
  }
}
