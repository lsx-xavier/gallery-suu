import { getFoldersByIdOrQuery } from "@/config/apis/google";
import { redis } from "@/config/redis";
import { processFolderStructure } from "../crawler/helper";

export async function checkIfFolderExists(currentFolderSlug: string, folderName: string) {
  try {
    const redisFolderKey = `folder:${currentFolderSlug}`;
    const folderData = await redis.hgetall(redisFolderKey);

    const rootGoogleFolderId = process.env.LINK_CLIENTES_FOLDER_ID;

    if (!folderData) {
      const query = `'${rootGoogleFolderId}' in parents and name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;

      const getIdOfCurrentFolderByName = await getFoldersByIdOrQuery({
        query,
        fields: 'files(id, name, mimeType)',
        resParams: { pageSize: 1000 }
      });

      if (getIdOfCurrentFolderByName.length === 0) {
        throw {
          message: `Folder not found: ${folderName}`,
          status: 404
        }
      }

      if (!getIdOfCurrentFolderByName[0].id) {
        throw {
          message: `Folder id not found: ${folderName}`,
          status: 404
        }
      }

      await processFolderStructure(getIdOfCurrentFolderByName[0], currentFolderSlug, (message) => console.log(message));

      const parentFolders = await getFoldersByIdOrQuery({
        folderId: getIdOfCurrentFolderByName[0].id,
        fields: 'files(id, name, mimeType)',
        resParams: { pageSize: 1000 }
      });

      for (const folder of parentFolders) {
        if (!folder.id || folder.name?.toLowerCase() === 'web') continue;

        await processFolderStructure(folder, currentFolderSlug, (message) => console.log(message));
      }
    }

    return folderData;
  } catch (error) {
    throw {
      message: `Error checking if folder exists: ${error}`,
      status: 500
    }
  }
}
