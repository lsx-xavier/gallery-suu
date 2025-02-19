
import { GoogleAuthApi, googleApi } from '@/config/apis/google';
import { gunzipSync } from 'zlib';

export default async function getUserOfFolder(folderName: string) {
  const tryGetKey = process.env.GOOGLE_KEY
  console.log(tryGetKey)
  return tryGetKey;
  try {
    const googleAuth = await GoogleAuthApi();
    const drive = googleApi.drive({ version: "v3", auth: googleAuth });

    const queryToFolders = `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName.replaceAll("-", " ")}'`;
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
      
      return resp.data.files?.[0] || undefined;
    });

    
    if(!maybeFolderId) {
      throw new Error("Didn't find the folder");
    }

    const queryToJson = `'${maybeFolderId.id}' in parents and mimeType = 'application/gzip'`;
    const maybeJson = await drive.files.list({
      q: queryToJson,
      fields: "files(id, name)",
    }).then(async (resp) => {
      if(!resp) {
        throw new Error("Nada foi encontrado.");
      }
      
      if( !resp.data.files || resp.data.files.length === 0) {
        throw new Error("Didn't find anything.");
      }
      
      
      if(!resp.data.files?.[0].id) {
        throw new Error("Didn't finde the json.");
      }
      
      const jsonFile = await drive.files.get({
        fileId: resp.data.files?.[0].id || "",
        alt: 'media', // Necessário para obter o arquivo de mídia
      }, {
        responseType: 'arraybuffer',
      })
      
      
      const unzip = gunzipSync(jsonFile.data as Buffer).toString('utf-8');
      const jsonData = JSON.parse(unzip);
      
      
      return jsonData || undefined;
    });

    return maybeJson
  } catch (error: unknown) {
    
    throw new Error( error?.message as string );
  }
}