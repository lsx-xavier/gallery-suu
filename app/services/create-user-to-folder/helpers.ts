import { getFoldersByIdOrQuery } from '@/config/apis/google';
import { redis } from '@/config/redis';
import { processFolderStructure } from '../crawler/helper';

export async function checkIfFolderExists(folders: string[]) {
  try {
    const rootGoogleFolderId = process.env.LINK_CLIENTES_FOLDER_ID;

    const currentRedisFolderKey = `folder:${folders.join(':')}`;

    console.log(`[create-user-to-folder] Finding folder in redis`, currentRedisFolderKey);
    const maybeCurrentFolder = await redis.hgetall(currentRedisFolderKey);

    if (maybeCurrentFolder) {
      return maybeCurrentFolder;
    }

    console.log(
      `[create-user-to-folder] Folder not registered in redis, searching for it in google drive`,
    );

    const query = `'${rootGoogleFolderId}' in parents and name = '${folders[0].replaceAll('-', ' ')}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;

    const getIdOfFolderByName = await getFoldersByIdOrQuery({
      query,
      fields: 'files(id, name, mimeType)',
      resParams: { pageSize: 1000 },
    });

    for (const folder of getIdOfFolderByName) {
      if (!folder.id || folder.name?.toLowerCase() === 'web') continue;

      await processFolderStructure(folder, undefined, (message) => console.log(message));
    }

    console.log(`[create-user-to-folder] All Folders Processed`);

    console.log(`[create-user-to-folder] Refined the folder data in redis`);
    const maybeCurrentFolderAfterProcess = await redis.hgetall(currentRedisFolderKey);
    console.log({ maybeCurrentFolderAfterProcess });

    if (maybeCurrentFolderAfterProcess) {
      return maybeCurrentFolderAfterProcess;
    } else {
      throw {
        message: `Folder not found in redis: ${currentRedisFolderKey}`,
        status: 404,
      };
    }
  } catch (error) {
    throw {
      message: `Error checking if folder exists: ${error}`,
      status: 500,
    };
  }
}
