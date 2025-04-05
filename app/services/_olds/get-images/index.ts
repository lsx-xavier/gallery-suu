import { GoogleAuthApi } from '@/config/apis/google';
import { google } from 'googleapis';

export default async function getImages(
  parentFolder: string,
  pageToken: string | undefined,
  limit: number | undefined,
  currentFolder?: string,
) {
  try {
    const googleAuth = await GoogleAuthApi();
    const drive = google.drive({ version: 'v3', auth: googleAuth });

    const queryToFolders = `name='${parentFolder.replaceAll('-', ' ')}' and mimeType = 'application/vnd.google-apps.folder' and  trashed = false`;
    const queryToSubFolders = (folderId: string) =>
      `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder'`;

    // Buscar todas as pastas no Google Drive
    const maybeFolderId = await drive.files
      .list({
        q: queryToFolders,
        fields: 'files(id, name)',
      })
      .then(async (resp) => {
        if (!resp) {
          throw new Error('Nada foi encontrado.');
        }

        if (!resp.data.files || resp.data.files.length === 0) {
          throw new Error('Nenhuma pasta encontrada.');
        }

        const parentFolders = await drive.files
          .list({
            q: `'${resp.data.files?.[0].id}' in parents and mimeType = 'application/vnd.google-apps.folder'`,
            fields: 'files(id, name)',
          })
          .then(async (resp) => {
            if (!resp.data.files || resp.data.files.length === 0) {
              throw new Error('Nenhuma pasta encontrada.');
            }

            return resp.data.files;
          });

        const parentFolderHasWeb = parentFolders?.find(
          (file) => file.name?.toLowerCase() === 'web',
        );

        if (!currentFolder && parentFolderHasWeb) {
          return parentFolderHasWeb.id;
        }

        console.log(parentFolders);

        return await drive.files
          .list({
            q: queryToSubFolders(
              parentFolders?.find(
                (file) =>
                  file.name?.toLowerCase() === currentFolder?.replaceAll('-', ' ').toLowerCase(),
              )?.id || '',
            ),
            fields: 'files(id, name)',
          })
          .then(async (resp) => {
            if (!resp.data.files || resp.data.files.length === 0) {
              throw new Error('Nenhuma pasta encontrada.');
            }

            return resp.data.files?.find((i) => i.name?.toLowerCase() === 'web')?.id;
          });
      })
      .catch((e) => {
        console.log(e);
      });

    const { imageFiles, nextPageToken } = await drive.files
      .list({
        q: `'${maybeFolderId}' in parents and mimeType contains 'image/'`,
        fields: 'files(id, name, webViewLink, webContentLink), nextPageToken',
        pageSize: limit, // Limita o número de arquivos retornados
        pageToken: pageToken, // Usa o token de página (start)
      })
      .then(async ({ data: { files, nextPageToken } }) => {
        // console.log(files)
        // const tempFiles: {id: string, image: string, name: string}[] = [];

        // await Promise.all((files || []).map(async (file) => {
        //   if (!file.id) return;

        //   try {
        //     const imageTemp = await google.drive({
        //       version: "v3",
        //       auth,
        //     }).files.get({
        //       fileId: file.id,
        //       alt: 'media', // Necessário para obter o arquivo de mídia
        //     }, {
        //       responseType: 'arraybuffer',
        //     });

        //     if(!imageTemp) return;

        //     // Armazena a imagem no Map
        //     tempFiles.push( {id: file.id, image: Buffer.from(imageTemp.data as string).toString('base64'), name: file.name});
        //   } catch (error) {
        //     console.error("Erro ao baixar imagem", error);
        //   }
        // }));

        return {
          imageFiles: files,
          nextPageToken,
        };
      });

    if (!imageFiles) {
      throw new Error('Ocorreu um erro em pegar as imagens');
    }

    return {
      imageFiles,
      nextPageToken: nextPageToken || 'END',
    };
  } catch (error) {
    throw new Error(error.message);
  }
}
