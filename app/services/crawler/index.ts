import { getFoldersByIdOrQuery } from "@/config/apis/google";
import httpClient from "@/config/httpClient";
import { drive_v3 } from "googleapis";


export type FoldersDto = {
  id: string;
  name: string;
  childs?: FoldersDto
}[]

export async function crawlerTheFolders() {
  try {
    const folderId = process.env.LINK_CLIENTES_FOLDER_ID
    console.log('[crawler-SERVICE] start', folderId)

    const parentFolders = await getFoldersByIdOrQuery({
      folderId: folderId!
    });

    console.log('[crawler-SERVICE] parentFolders', parentFolders)

    const folders = [];
    async function findWebFolderOrImage(folder: drive_v3.Schema$File) {
      const hierarchy: { id: string, name: string, childs: drive_v3.Schema$File[] } = {
        id: folder.id!,
        name: folder.name!,
        childs: []
      };

      try {
        const maybeFinded = await getFoldersByIdOrQuery({
          query: `'${folder.id}' in parents and (mimeType = 'application/vnd.google-apps.folder' or mimeType contains 'image/') and trashed = false`,
          fields: 'files(id, name, mimeType)'
        })


        const findTheWebFolder = maybeFinded.find(i => i.name?.toLowerCase() === 'web');
        if (findTheWebFolder) {
          hierarchy.childs.push({
            id: findTheWebFolder.id,
            name: findTheWebFolder.name
          });

          return hierarchy;
        }

        const findTheImageFolder = maybeFinded.find(i => i.mimeType?.startsWith("image/"))
        if (findTheImageFolder) {
          return hierarchy;
        }

        for (const maybe of maybeFinded.filter(i => i.mimeType === "application/vnd.google-apps.folder")) {
          if (!maybe.id) continue;

          const found = await findWebFolderOrImage(maybe);

          if (found) {
            hierarchy.childs.push(found);
          }
        }

        return hierarchy
      } catch (err) {
        throw {
          message: err,
          status: 404
        }
      }
    }

    for (const parent of parentFolders) {
      if (parent.name?.toLowerCase() === 'web') {
        folders.push({
          id: parent.id,
          name: parent.name,
        })
        continue;
      }

      if (!parent.id) continue;

      const finded = await findWebFolderOrImage(parent)

      folders.push(finded)
    }
    
    try {
      const jsonData = JSON.stringify(folders, null, 2);
      // const jsonData = JSON.stringify({ teste: 'teste' }, null, 2);

      const response = await httpClient.post({
        url: '/EdgeStore',
        body: {
          items: [
            {
              operation: "upsert",
              key: "drive_structure",
              value: jsonData
            }
          ]
        }
      });

      console.log('response', response)

      return response;

      // // Compacta o JSON usando Gzip
      // const compressedData = zlib.gzipSync(jsonData);

      // const filePath = path.join(process.cwd(), "public", "drive_structure.gzip");
      // fs.writeFileSync(filePath, compressedData, 'binary');
    } catch(err) {
      const error = err as {
        body: string;
        status: number | string;
      };

      throw {
        message: `[crawler-SERVICE] Error of edge on crawler: ${error?.body}`,
        code: error?.status || 500
      }
    }
  } catch(error) {
    throw error
  }
}