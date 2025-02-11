import { googleApi, GoogleAuthApi } from '@/config/apis/google';
import fs from 'fs';
import path from 'path';
import zlib from "zlib";


function findFolderAndCheckWeb(folders, targetName, parentFolder?: string | undefined) {
  for (const folder of folders) {
    const folderNameLowercase = folder.name.toLowerCase()
    const targetNameLowerCase = targetName.toLowerCase()

    if(parentFolder && parentFolder.toLowerCase() !== folderNameLowercase) {
      continue;
    }
    
    if(parentFolder && parentFolder.toLowerCase() === folderNameLowercase) {
      if (targetNameLowerCase === folderNameLowercase) {
        const hasWebFolder = folder.childs.find(child => child.name.toLowerCase() === "web");

        if(hasWebFolder) {
          return hasWebFolder
        } else {
          return folder;
        }
      }

      if (folder.childs?.length > 0) {
        const found = findFolderAndCheckWeb(folder.childs, targetName);
        if (found) {
          return found;
        }
      }
    }
   

    if(folderNameLowercase === targetNameLowerCase) {
      const hasWebFolder = folder.childs.find(child => child.name.toLowerCase() === "web");

      if(hasWebFolder) {
        return hasWebFolder
      } else {
        return folder
      }

    } 
  }

  return null;
}

export  default async function getImagesFrom(targetFolder: string, parentFolder?: string) {
  try{
    console.log({targetFolder}, {parentFolder})
    // Caminho do arquivo compactado
    const filePath = path.join(process.cwd(), "public", "drive_structure.gz");
    
    const compressedData = fs.readFileSync(filePath);
    const decompressedData = zlib.gunzipSync(compressedData);
    const jsonData: [[[]]] = JSON.parse(decompressedData.toString("utf-8"));

    const findTheFolder = findFolderAndCheckWeb(jsonData, targetFolder.replaceAll("-", " "), parentFolder?.replaceAll("-", " "));

    const googleAuth = await GoogleAuthApi();
    const drive = googleApi.drive({ version: "v3", auth: googleAuth });

    const {imageFiles} = await drive.files.list({
      q: `'${findTheFolder.id}' in parents and mimeType contains 'image/'`,
      fields: "files(id, name, webViewLink, webContentLink), nextPageToken",
      // pageSize: 10, // Limita o número de arquivos retornados
      // pageToken: undefined,  // Usa o token de página (start)
    }).then(async ({data: {files}}) => ({
      imageFiles: files,
      // nextPageToken: nextPageToken
    }));

    return {imageFiles}
  }catch(err) {
    console.log(err)
  }
}
