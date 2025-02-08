import { GoogleAuthApi, googleApi } from "@/config/apis/google";
import fs from "fs";
import path from "path";
import zlib from "zlib";

export type FoldersDto = {
  id: string;
  name: string;
  childs?: FoldersDto
}[]

export async function listFolders() {
  try {
    const googleAuth = await GoogleAuthApi();
    const drive = googleApi.drive({ version: "v3", auth: googleAuth });

    const linkClientesFolderId = await drive.files.list({
      q: "name contains 'LINK CLIENTES'  and trashed = false",
      fields: "files(id, name)",
    }).then(resp => resp.data.files?.[0].id)
    const queryGetAllFoldersWithOutWebAlta = `'${linkClientesFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder'`
    
    
   
    const parentFolders = await drive.files.list({
      q: queryGetAllFoldersWithOutWebAlta,
      fields: "files(id, name)",
    }).then(async (resp) => {
      if(!resp) { 
        throw new Error("Not have response")
      }
      const allFolders = resp.data.files;

      
      if(!allFolders || allFolders.length === 0) {
        throw new Error("Didn't find folders")
      }
      
      return allFolders;
    })

    if(!parentFolders || parentFolders.length === 0) {
      throw new Error("Broken folders")
    }

    const findChildFoldersWebAlt =  async (folderId: string) => {
      const queryGetAllFoldersWithOutWebAlta = `'${folderId}' in parents and (name = 'WEB' or name = 'Alta') and  mimeType = 'application/vnd.google-apps.folder'`
      
      return await drive.files.list({
        q: queryGetAllFoldersWithOutWebAlta,
        fields: "files(id, name)",
      }).then(async (resp) => {
        if(!resp) { 
          throw new Error("Not have response")
        }

        const foldersWithWebAlt = resp.data.files;
        if(foldersWithWebAlt?.length === 0) {
          console.error("Didn't find folders like 'WEB' and 'Alta'")
          return;
        }
  
        return foldersWithWebAlt;
      })
    }

    const findChildFoldersNotWebAlt =  async (folderId: string) => {
      const queryGetAllFoldersWithOutWebAlta = `'${folderId}' in parents and not (name = 'WEB' or name = 'Alta') and  mimeType = 'application/vnd.google-apps.folder'`
      
      return await drive.files.list({
        q: queryGetAllFoldersWithOutWebAlta,
        fields: "files(id, name)",
      }).then(async (resp) => {
        if(!resp) { 
          throw new Error("Not have response")
        }
        const foldersWithOutWebAlt = resp.data.files;
        
        if( foldersWithOutWebAlt?.length === 0) {
          console.error("Didn't find folders not like 'WEB' and 'Alta'");
          return;
        }
  
        return foldersWithOutWebAlt;
      })
    }

    const folders: FoldersDto = [];
    
    for (const parent of parentFolders) {
      const childFolders: FoldersDto = [];
      const subChildFolders: FoldersDto = [];

      if(parent.name?.toLowerCase().includes('web') || parent.name?.toLowerCase().includes('alta')) {
        folders.push({
          id: parent.id!,
          name: parent.name,
        })
        continue;
      }

      const webAltFolders = await findChildFoldersWebAlt(parent.id as string);

      if(webAltFolders) {
        for(const webAltFolder of webAltFolders) {
          if(!webAltFolder.id || !webAltFolder.name) continue;
          
          childFolders.push({
            id: webAltFolder.id,
            name: webAltFolder.name
          })
        }

        folders.push({
          id: parent.id!,
          name: parent.name!,
          childs: childFolders,
        })
      } else {
        const subChildFoldersList = await findChildFoldersNotWebAlt(parent.id as string);
        
        if(subChildFoldersList) {
          for(const subChildFoldersResp of subChildFoldersList) {
            if(!subChildFoldersResp.id || !subChildFoldersResp.name) continue;

            const webAltFolders = await findChildFoldersWebAlt(parent.id as string);

            if(webAltFolders) {
              for(const webAltFolder of webAltFolders) {
                if(!webAltFolder.id || !webAltFolder.name) continue;

                subChildFolders.push({
                  id: webAltFolder.id,
                  name: webAltFolder.name
                })
              }
              
              childFolders.push({
                id: subChildFoldersResp.id!,
                name: subChildFoldersResp.name!,
                childs: subChildFolders,
              })

              folders.push({
                id: parent.id!,
                name: parent.name!,
                childs: childFolders,
              })

            } else {
              childFolders.push({
                id: subChildFoldersResp.id!,
                name: subChildFoldersResp.name!
              })
  
              folders.push({
                id: parent.id!,
                name: parent.name!,
                childs: childFolders,
              })
              continue;
            } 
          }
        }
      }
    }

    const jsonData = JSON.stringify(folders, null, 2);

    // Compacta o JSON usando Gzip
    const compressedData = zlib.gzipSync(jsonData);

    const filePath = path.join(process.cwd(), "public", "drive_structure.gzip");
    fs.writeFileSync(filePath, compressedData, 'binary');


    console.log(`Arquivo salvo em: ${filePath}`);

  } catch (error) {
    console.error("Erro ao listar pastas e arquivos:", error);
    return {};
  }
}