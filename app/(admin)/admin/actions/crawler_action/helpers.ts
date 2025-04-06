import { getFoldersByIdOrQuery } from '@/infra/config/apis/google';
import prisma from '@/infra/config/primsa';
import { createSlug } from '@/infra/utils/create-slug';
import { drive_v3 } from 'googleapis';
import _ from 'lodash';
import {
  BatchOperationResult,
  FolderOfPhotosOrWeb,
  MaybeSaveOnDBProps,
  ProcessFolderStructureProps,
} from './types';
import { Folder } from '@prisma/client';
import { driveWithAuth } from '@/infra/config/apis/google';

export async function maybeSaveOnDB({
  foldersData,
  onProgress,
}: MaybeSaveOnDBProps): Promise<BatchOperationResult[]> {
  const existingFolders = await prisma.folder.findMany({
    where: {
      slugFolder: { in: foldersData.map((folder) => folder.slugFolder) },
    },
    select: {
      id: true,
      slugFolder: true,
      folderName: true,
      folderId: true,
      parentName: true,
      slugParent: true,
      parentId: true,
      folderIdOfPhotos: true,
      thumbId: true,
      createdAt: true,
    },
  });

  const existingFolderMap = new Map(existingFolders.map((folder) => [folder.slugFolder, folder]));

  const operations: {
    create: typeof foldersData;
    update: {
      where: { id: string };
      data: Omit<(typeof foldersData)[0], 'id'>;
    }[];
  } = {
    create: [],
    update: [],
  };

  // 2. Processamento em lotes menores para melhor performance
  const BATCH_SIZE = 100;
  const results: BatchOperationResult[] = [];

  // 3. Separação mais eficiente de creates e updates
  for (const folderData of foldersData) {
    const existing = existingFolderMap.get(folderData.slugFolder);

    if (existing) {
      // Comparação mais eficiente usando campos específicos
      const needsUpdate = !_.isEqual(
        _.pick(existing, [
          'folderName',
          'folderId',
          'parentName',
          'slugParent',
          'parentId',
          'folderIdOfPhotos',
        ]),
        _.pick(folderData, [
          'folderName',
          'folderId',
          'parentName',
          'slugParent',
          'parentId',
          'folderIdOfPhotos',
        ]),
      );

      if (needsUpdate) {
        operations.update.push({
          where: { id: existing.id },
          data: _.omit(folderData, ['id']),
        });
        onProgress?.(`[DB-Operation] Folder marked for update: ${folderData.slugFolder}`);
      }
    } else {
      operations.create.push(folderData);
      onProgress?.(`[DB-Operation] Folder marked for creation: ${folderData.slugFolder}`);
    }
  }

  // 4. Processamento em transação para garantir consistência
  await prisma.$transaction(async (tx) => {
    // 5. Processamento em lotes para updates
    for (let i = 0; i < operations.update.length; i += BATCH_SIZE) {
      const batch = operations.update.slice(i, i + BATCH_SIZE);
      try {
        await Promise.all(batch.map((update) => tx.folder.update(update)));

        results.push({
          success: true,
          count: batch.length,
          operation: 'update',
        });

        onProgress?.(`[DB-Operation] Updated batch of ${batch.length} folders`);
      } catch (error) {
        results.push({
          success: false,
          count: 0,
          operation: 'update',
          error: error instanceof Error ? error.message : 'Unknown error during update',
        });
      }
    }

    // 6. Processamento em lotes para creates
    for (let i = 0; i < operations.create.length; i += BATCH_SIZE) {
      const batch = operations.create.slice(i, i + BATCH_SIZE);
      try {
        await tx.folder.createMany({
          data: batch,
          skipDuplicates: true, // Evita erros de duplicação
        });

        results.push({
          success: true,
          count: batch.length,
          operation: 'create',
        });

        onProgress?.(`[DB-Operation] Created batch of ${batch.length} folders`);
      } catch (error) {
        results.push({
          success: false,
          count: 0,
          operation: 'create',
          error: error instanceof Error ? error.message : 'Unknown error during creation',
        });
      }
    }
  });

  return results;
}

export function checkIfHasPhotosOrWebFolder(items: drive_v3.Schema$File[]): FolderOfPhotosOrWeb {
  return {
    webFolder: items.find((i) => i.name?.toLowerCase() === 'web'),
    hasImages: items.find((i) => i.mimeType?.startsWith('image/')),
    subFolders: items.filter(
      (i) =>
        i.mimeType === 'application/vnd.google-apps.folder' && i.name?.toLowerCase() !== 'alta',
    ),
  };
}

export async function processFolderStructure({
  folder,
  allFolders,
  onProgress,
  parentInfo = {
    slugParent: 'FATHER',
    parentName: 'FATHER',
    parentId: 'undefined',
  },
}: ProcessFolderStructureProps) {
  const handleProgress = onProgress ?? console.log;

  try {
    if (folder.name?.toLowerCase() === 'web') {
      return;
    }

    if (!folder.id || !folder.name) {
      throw new Error(
        `[process-folder-structure] Invalid folder structure: Missing id or name for folder ${JSON.stringify(folder)}`,
      );
    }

    handleProgress(`[process-folder-structure] Start process of folder: ${folder.name}`);

    const currentSlug = createSlug(folder.name!);

    const items = await getFoldersByIdOrQuery({
      query: `'${folder.id}' in parents and (mimeType = 'application/vnd.google-apps.folder' or mimeType contains 'image/') and trashed = false`,
      fields: 'files(id, name, mimeType)',
      resParams: { pageSize: 1000 },
    });

    const { webFolder, hasImages, subFolders } = checkIfHasPhotosOrWebFolder(items);

    if (webFolder || hasImages) {
      const folderIdOfPhotos: string = webFolder
        ? (webFolder.id as string)
        : hasImages
          ? folder.id
          : '';

      const newFolder: Folder = {
        id: '',
        folderId: folder.id,
        folderName: folder.name,
        slugFolder: currentSlug,
        folderIdOfPhotos,
        ...parentInfo,
        thumbId: '',
        createdAt: new Date(),
      };

      allFolders?.push(newFolder);
      handleProgress(`[process-folder-structure] Added new folder: ${newFolder.folderName}`);
    }

    if (!subFolders) {
      return;
    }

    // Process subfolders concurrently for better performance
    await Promise.all(
      subFolders?.map((subFolder) =>
        processFolderStructure({
          folder: subFolder,
          allFolders,
          onProgress,
          parentInfo: {
            slugParent: currentSlug,
            parentName: folder.name as string,
            parentId: folder.id as string,
          },
        }),
      ),
    );

    handleProgress(`[process-folder-structure] Completed processing folder: ${folder.name}`);
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    console.error('[process-folder-structure] Error:', {
      folderId: folder.id,
      folderName: folder.name,
      error: error.message,
    });

    throw {
      message: `[process-folder-structure] Error: ${folder.name}: ${error.message}`,
      code: 'CRAWLER_ERROR',
      folder: folder.id,
    };
  }
}

async function isInRootFolderTree(
  drive: drive_v3.Drive,
  fileId: string,
  rootFolderId: string,
): Promise<boolean> {
  try {
    const file = await drive.files.get({
      fileId,
      fields: 'parents',
      supportsAllDrives: true,
    });

    if (!file.data.parents) {
      return false;
    }

    // Se está diretamente na pasta raiz
    if (file.data.parents.includes(rootFolderId)) {
      return true;
    }

    // Verifica recursivamente os parents até encontrar a pasta raiz ou chegar ao topo
    for (const parentId of file.data.parents) {
      if (await isInRootFolderTree(drive, parentId, rootFolderId)) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error(`[isInRootFolderTree] Error checking parents for file ${fileId}:`, error);
    return false;
  }
}

export async function getChangesFromDrive(startPageToken?: string) {
  try {
    const drive = await driveWithAuth();
    const rootFolderId = process.env.LINK_CLIENTES_FOLDER_ID;

    if (!rootFolderId) {
      throw new Error('[getChangesFromDrive] ROOT ID of folders is not defined');
    }

    // Se não tiver startPageToken, precisamos pegar um token inicial
    if (!startPageToken) {
      const response = await drive.changes.getStartPageToken({
        supportsAllDrives: true,
      });

      return {
        changes: [],
        newStartPageToken: response.data.startPageToken,
      };
    }

    // Se tiver startPageToken, listamos as mudanças
    const changes = await drive.changes.list({
      pageToken: startPageToken,
      spaces: 'drive',
      // Filtrando apenas campos necessários
      fields: 'changes(fileId,file(id,name,mimeType,parents)),newStartPageToken',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
      restrictToMyDrive: false,
    });

    // Filtra apenas mudanças relevantes
    const relevantChanges = [];

    if (changes.data.changes) {
      for (const change of changes.data.changes) {
        // Pula se o arquivo foi removido ou não tem informações
        if (!change.file || change.removed) {
          continue;
        }

        // Verifica se é pasta ou imagem
        const isFolderOrImage =
          change.file.mimeType === 'application/vnd.google-apps.folder' ||
          change.file.mimeType?.startsWith('image/');

        if (!isFolderOrImage) {
          continue;
        }

        // Verifica se está na árvore da pasta raiz
        const isInTree = await isInRootFolderTree(drive, change.file.id!, rootFolderId);

        if (isInTree) {
          relevantChanges.push(change);
          console.log('[getChangesFromDrive] Found relevant change:', {
            name: change.file.name,
            type: change.file.mimeType,
            id: change.file.id,
          });
        }
      }
    }

    const filteredChanges = {
      ...changes.data,
      changes: relevantChanges,
    };

    console.log('[getChangesFromDrive] Changes summary:', {
      totalChanges: changes.data.changes?.length || 0,
      relevantChanges: relevantChanges.length,
    });

    return filteredChanges;
  } catch (error) {
    console.error('[getChangesFromDrive] Error:', error);
    throw error;
  }
}

export async function checkFoldersDifferences() {
  const dbFolders = await prisma.folder.findMany({
    select: {
      folderId: true,
      folderName: true,
      slugFolder: true,
      folderIdOfPhotos: true,
    },
  });

  const dbFolderMap = new Map(dbFolders.map((folder) => [folder.folderId, folder]));

  return {
    dbFolders,
    dbFolderMap,
  };
}

export async function findNewFoldersInDrive(onProgress?: (message: string) => void) {
  try {
    const rootFolderId = process.env.LINK_CLIENTES_FOLDER_ID;
    if (!rootFolderId) {
      throw new Error('[findNewFolders] ROOT ID of folders is not defined');
    }

    // 1. Pega todas as pastas do DB
    const dbFolders = await prisma.folder.findMany({
      select: {
        folderId: true,
      },
    });
    const dbFolderIds = new Set(dbFolders.map((f) => f.folderId));

    // 2. Busca todas as pastas no Drive dentro do LINK_ROOT
    const driveFolders = await getFoldersByIdOrQuery({
      query: `'${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name, mimeType, parents)',
      resParams: {
        // pageSize: 1000,
        // orderBy: 'createdTime desc', // Pega as mais recentes primeiro
      },
    });

    // 3. Filtra apenas as pastas que não estão no DB
    const newFolders = driveFolders.filter((folder) => !dbFolderIds.has(folder.id!));

    onProgress?.(`[findNewFolders] Found ${newFolders.length} potential new folders`);

    // 4. Processa as novas pastas usando a lógica existente
    const foldersToProcess: Folder[] = [];

    for (const folder of newFolders) {
      await processFolderStructure({
        folder,
        allFolders: foldersToProcess,
        onProgress,
      });
    }

    return foldersToProcess;
  } catch (error) {
    console.error('[findNewFolders] Error:', error);
    throw error;
  }
}
