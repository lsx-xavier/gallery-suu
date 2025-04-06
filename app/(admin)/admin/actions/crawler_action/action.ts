import { Folder } from '@prisma/client';
import {
  maybeSaveOnDB,
  processFolderStructure,
  checkFoldersDifferences,
  getChangesFromDrive,
  findNewFoldersInDrive,
} from './helpers';
import prisma from '@/infra/config/primsa';
import { getFoldersByIdOrQuery } from '@/(infra)/config/apis/google';

export async function getInitialFoldersOrUpdateExistingFolders() {
  try {
    console.log('[CRAWLER-ACTION] start');
    const folderId = process.env.LINK_CLIENTES_FOLDER_ID;

    if (!folderId) {
      throw new Error('ROOT ID of folders is not defined');
    }

    const parentFolders = await getFoldersByIdOrQuery({
      folderId: folderId!,
      fields: 'files(id, name, mimeType)',
      resParams: { pageSize: 1000 },
    });

    const allFolders: Folder[] = [];

    for (const parent of parentFolders) {
      if (!parent.id || parent.name?.toLowerCase() === 'web') continue;

      await processFolderStructure({
        folder: parent,
        allFolders,
        onProgress: (message) => console.log(message),
      });
    }

    // Após processar todas as pastas, salva no banco
    if (allFolders.length > 0) {
      console.log('[CRAWLER-ACTION] Starting database operations');

      const results = await maybeSaveOnDB({
        foldersData: allFolders,
        onProgress: (message) => console.log(message),
      });

      // Log dos resultados das operações
      console.log('[CRAWLER-ACTION] Database operations results:', {
        creates: results.filter((r) => r.operation === 'create'),
        updates: results.filter((r) => r.operation === 'update'),
        errors: results.filter((r) => !r.success),
      });
    }

    console.log('[CRAWLER-ACTION] Process completed successfully', {
      totalFoldersProcessed: allFolders.length,
    });
  } catch (error) {
    console.error('[CRAWLER-ACTION] Error during process:', error);
    throw error;
  }
}

// Nova action para sincronizar usando Google Drive Changes API
export async function syncFoldersUsingDriveChanges() {
  try {
    console.log('[SYNC-FOLDERS] Starting sync process');

    // Inicializa sem pageToken se não houver sincronização prévia
    let startPageToken: string | undefined;

    try {
      const lastSync = await prisma.syncControl.findFirst({
        where: { type: 'DRIVE_FOLDERS' },
        orderBy: { createdAt: 'desc' },
      });

      startPageToken = lastSync?.lastPageToken;
    } catch {
      console.log('[SYNC-FOLDERS] No previous sync found, starting fresh');
    }

    const changes = await getChangesFromDrive(startPageToken);

    if (!changes?.changes?.length) {
      console.log('[SYNC-FOLDERS] No changes found');
      return;
    }

    const foldersToProcess = changes.changes
      .filter(
        (change) =>
          change.file?.mimeType === 'application/vnd.google-apps.folder' && !change.removed,
      )
      .map((change) => change.file!);

    const allFolders: Folder[] = [];

    // Processa apenas as pastas modificadas
    for (const folder of foldersToProcess) {
      await processFolderStructure({
        folder,
        allFolders,
        onProgress: (message) => console.log(`[SYNC-FOLDERS] ${message}`),
      });
    }

    if (allFolders.length > 0) {
      const results = await maybeSaveOnDB({
        foldersData: allFolders,
        onProgress: (message) => console.log(`[SYNC-FOLDERS] ${message}`),
      });

      console.log('[SYNC-FOLDERS] Sync results:', {
        processed: allFolders.length,
        updated: results.filter((r) => r.operation === 'update').length,
        created: results.filter((r) => r.operation === 'create').length,
        errors: results.filter((r) => !r.success).length,
      });
    }

    // Salva o novo token apenas se tiver mudanças
    if (changes.newStartPageToken) {
      await prisma.syncControl.create({
        data: {
          type: 'DRIVE_FOLDERS',
          lastPageToken: changes.newStartPageToken,
          createdAt: new Date(),
        },
      });
    }
  } catch (error) {
    console.error('[SYNC-FOLDERS] Error:', error);
    throw error;
  }
}

// Nova action para verificar diferenças manualmente
export async function checkFoldersStatus() {
  try {
    console.log('[FOLDER-STATUS] Starting folder check');

    const { dbFolders, dbFolderMap } = await checkFoldersDifferences();

    // Busca todas as pastas do Drive
    const driveFolders = await getFoldersByIdOrQuery({
      folderId: process.env.LINK_CLIENTES_FOLDER_ID!,
      fields: 'files(id, name, mimeType)',
      resParams: { pageSize: 1000 },
    });

    const differences = {
      notInDB: [] as typeof driveFolders,
      notInDrive: [] as typeof dbFolders,
      modified: [] as typeof driveFolders,
    };

    // Compara as pastas
    for (const driveFolder of driveFolders) {
      const dbFolder = dbFolderMap.get(driveFolder.id!);

      if (!dbFolder) {
        differences.notInDB.push(driveFolder);
      } else if (dbFolder.folderName !== driveFolder.name) {
        differences.modified.push(driveFolder);
      }
    }

    // Encontra pastas que existem no DB mas não no Drive
    const driveFolderIds = new Set(driveFolders.map((f) => f.id));
    differences.notInDrive = dbFolders.filter((dbFolder) => !driveFolderIds.has(dbFolder.folderId));

    console.log('[FOLDER-STATUS] Check completed', {
      totalInDB: dbFolders.length,
      totalInDrive: driveFolders.length,
      differences: {
        newFolders: differences.notInDB.length,
        removedFolders: differences.notInDrive.length,
        modifiedFolders: differences.modified.length,
      },
    });

    return differences;
  } catch (error) {
    console.error('[FOLDER-STATUS] Error:', error);
    throw error;
  }
}

// Nova action para sincronizar novas pastas
export async function syncNewFolders() {
  try {
    console.log('[SYNC-NEW-FOLDERS] Starting sync process');

    const newFolders = await findNewFoldersInDrive((message) => {
      console.log(message);
    });

    if (newFolders.length > 0) {
      console.log(`[SYNC-NEW-FOLDERS] Processing ${newFolders.length} new folders`);

      const results = await maybeSaveOnDB({
        foldersData: newFolders,
        onProgress: (message) => console.log(message),
      });

      return {
        success: true,
        newFolders: newFolders.length,
        created: results.filter((r) => r.operation === 'create').length,
        updated: results.filter((r) => r.operation === 'update').length,
        errors: results.filter((r) => !r.success),
      };
    }

    return {
      success: true,
      newFolders: 0,
      message: 'No new folders found',
    };
  } catch (error) {
    console.error('[SYNC-NEW-FOLDERS] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
