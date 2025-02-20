import { googleApi, GoogleAuthApi } from '@/config/apis/google';
import { findFolderAndCheckWeb } from '@/utils/findTheFolderOfImage';




export  default async function getImagesFrom(targetFolder: string, parentFolder?: string, limit: number = 30, nextPageTokenProp: string | undefined = undefined) {
  try{
    // // Caminho do arquivo compactado
    // const filePath = path.join(process.cwd(), "src/files/drive_structure.gz");
    
    // const compressedData = fs.readFileSync(filePath);
    // const decompressedData = zlib.gunzipSync(compressedData);
    // const jsonData: [[[]]] = JSON.parse(decompressedData.toString("utf-8"));

    // const findTheFolder = findFolderAndCheckWeb(jsonData, targetFolder.replaceAll("-", " "), parentFolder?.replaceAll("-", " ") || undefined);
    const findTheFolder = await findFolderAndCheckWeb({targetName: targetFolder.replaceAll("-", " "), parentFolder: parentFolder?.replaceAll("-", " ") || undefined});
    
    if(!findTheFolder) {
      throw {
        body: "Didin't find the folder to get images",
        code: 404
      }
    }

    const googleAuth = await GoogleAuthApi();
    const drive = googleApi.drive({ version: "v3", auth: googleAuth });

    const {imageFiles, nextPageToken} = await drive.files.list({
      q: `'${findTheFolder.id}' in parents and mimeType contains 'image/'`,
      fields: "files(id, name, webViewLink, webContentLink), nextPageToken",
      pageSize: limit, // Limita o número de arquivos retornados
      pageToken: nextPageTokenProp,  // Usa o token de página (start)
    }).then(async ({data: {files, nextPageToken}}) => ({
      imageFiles: files,
      nextPageToken: nextPageToken
    }));

    return {imageFiles, nextPageToken}
  }catch(err) {
    console.log(err)
  }
}
