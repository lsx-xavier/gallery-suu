import { getFoldersByIdOrQuery } from '@/src/config/apis/google';
import { createSlug } from '@/src/utils/create-slug';
import { maybeSaveToMongoDb, processFolderStructure } from './helper';
import { FolderStructure, OnProgress } from './types';

export async function crawlerTheFolders(onProgress?: OnProgress) {
  try {
    const folderId = process.env.LINK_CLIENTES_FOLDER_ID;
    console.log('[crawler-SERVICE] start');

    const parentFolders = await getFoldersByIdOrQuery({
      folderId: folderId!,
      fields: 'files(id, name, mimeType)',
      resParams: { pageSize: 1000 },
    });
    const allFolders: FolderStructure[] = [];

    for (const parent of parentFolders) {
      if (!parent.id || parent.name?.toLowerCase() === 'web') continue;
      const parentSlug = createSlug(parent.name!);

      await processFolderStructure(
        parent,
        parentSlug,
        parent.name!,
        parent.id,
        onProgress,
        allFolders,
      );
    }

    await maybeSaveToMongoDb({ foldersData: allFolders, onProgress });

    console.log('[crawler-SERVICE] Processed folders finished');
  } catch (error) {
    console.error('[crawler-SERVICE] Error:', error);
    throw error;
  }
}
