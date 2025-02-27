import { getFoldersByIdOrQuery } from "@/config/apis/google";
import { redis } from "@/config/redis";
import { createSlug } from "@/utils/create-slug";
import { processFolderStructure } from "../crawler/helper";

export async function checkIfFolderExists(folders: string[]) {
  try {
    const rootGoogleFolderId = process.env.LINK_CLIENTES_FOLDER_ID;

    const currentFolderSlug = createSlug(folders[folders.length - 1]);
    const currentRedisFolderKey = `folder:${currentFolderSlug}`;

    console.log(`[create-user-to-folder] Finding folder in redis`)
    const maybeCurrentFolder = await redis.hgetall(currentRedisFolderKey);

    console.log({ currentRedisFolderKey })
    console.log({ maybeCurrentFolder })

    if (maybeCurrentFolder) {
      return maybeCurrentFolder;
    }

    console.log(`[create-user-to-folder] Folder not registered in redis, searching for it in google drive`)


    const query = `'${rootGoogleFolderId}' in parents and name = '${folders[0].replaceAll('-', ' ')}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;

    const getIdOfFolderByName = await getFoldersByIdOrQuery({
      query,
      fields: 'files(id, name, mimeType)',
      resParams: { pageSize: 1000 }
    });

    for (const folder of getIdOfFolderByName) {
      if (!folder.id || folder.name?.toLowerCase() === 'web') continue;

      await processFolderStructure(folder, undefined, (message) => console.log(message));
    }

    console.log(`[create-user-to-folder] All Folders Processed`)

    console.log(`[create-user-to-folder] Refined the folder data in redis`)
    const maybeCurrentFolderAfterProcess = await redis.hgetall(currentRedisFolderKey);
    console.log({ maybeCurrentFolderAfterProcess })

    if (maybeCurrentFolderAfterProcess) {
      return maybeCurrentFolderAfterProcess;
    }

    // if (!folderData) {
    //   const query = `'${rootGoogleFolderId}' in parents and name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;

    //   const getIdOfCurrentFolderByName = await getFoldersByIdOrQuery({
    //     query,
    //     fields: 'files(id, name, mimeType)',
    //     resParams: { pageSize: 1000 }
    //   });

    //   if (getIdOfCurrentFolderByName.length === 0) {
    //     throw {
    //       message: `Folder not found: ${folderName}`,
    //       status: 404
    //     }
    //   }

    //   if (!getIdOfCurrentFolderByName[0].id) {
    //     throw {
    //       message: `Folder id not found: ${folderName}`,
    //       status: 404
    //     }
    //   }

    //   await processFolderStructure(getIdOfCurrentFolderByName[0], currentFolderSlug, (message) => console.log(message));

    //   const parentFolders = await getFoldersByIdOrQuery({
    //     folderId: getIdOfCurrentFolderByName[0].id,
    //     fields: 'files(id, name, mimeType)',
    //     resParams: { pageSize: 1000 }
    //   });

    //   for (const folder of parentFolders) {
    //     if (!folder.id || folder.name?.toLowerCase() === 'web') continue;

    //     await processFolderStructure(folder, currentFolderSlug, (message) => console.log(message));
    //   }
    // }

    // return folderData;
  } catch (error) {
    throw {
      message: `Error checking if folder exists: ${error}`,
      status: 500
    }
  }
}
