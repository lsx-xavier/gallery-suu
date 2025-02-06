
import fs from "fs";
import { google } from 'googleapis';
import path from "path";

export default async function getImages(folderName: string, pageToken: string | undefined, limit: number | undefined) {
  try {
    const keyPath = path.join(process.cwd(), "public/suu-fotos.key.json");
    const credentials = JSON.parse(fs.readFileSync(keyPath, "utf-8"));
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    console.log({folderName})

    const drive = google.drive({ version: "v3", auth });
    
    const queryToFolders = `mimeType = 'application/vnd.google-apps.folder' and name contains '${folderName}' and trashed = false`;
    const queryToSubFolders = ( folderId: string) => `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder'`;

    // Buscar todas as pastas no Google Drive
    const maybeFolderId = await drive.files.list({
      q: queryToFolders,
      fields: "files(id, name)",
    }).then(async (resp) => {
      if(!resp) {
        throw new Error("Nada foi encontrado.");
      }

      if( !resp.data.files || resp.data.files.length === 0) {
        throw new Error("Nenhuma pasta encontrada.");
      }

      return await drive.files.list({
        q: queryToSubFolders( resp.data.files?.[0].id || ""),
        fields: "files(id, name)",
      }).then(async (resp) => {
        console.log({resp: resp.data.files})
        
        if(!resp.data.files || resp.data.files.length === 0) {
          throw new Error("Nenhuma pasta encontrada.");
        }

        return resp.data.files?.find(i => i.name?.toLowerCase() === 'web')?.id
      })
    });
    
    const {imageFiles, nextPageToken} = await drive.files.list({
      q: `'${maybeFolderId}' in parents and mimeType contains 'image/'`,
      fields: "files(id, name, webViewLink, webContentLink), nextPageToken",
      pageSize: limit, // Limita o número de arquivos retornados
      pageToken: pageToken,  // Usa o token de página (start)
    }).then(async ({data: {files, nextPageToken}}) => {
      console.log(files)
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
        imageFiles: files, nextPageToken
      }
    });

    if(!imageFiles) {
      throw new Error("Ocorreu um erro em pegar as imagens");
    }

    return {
      imageFiles,
      nextPageToken: nextPageToken || "END"
    };
  } catch (error) {
    throw new Error( error.message );
  }
}