import { getFoldersByIdOrQuery } from '@/(infra)/config/apis/google';
import prisma from '@/(infra)/config/primsa';
import { createSlug } from '@/(infra)/utils/create-slug';
import { drive_v3 } from 'googleapis';
import _ from 'lodash';
import { FolderStructure, maybeSaveToMongoDbProps, OnProgress } from './types';

export async function maybeSaveToMongoDb({ foldersData, onProgress }: maybeSaveToMongoDbProps) {
  const existingFolders = await prisma.folder.findMany({
    where: {
      slugFolder: { in: foldersData.map((folder) => folder.slugFolder) },
    },
  });

  const existingFolderMap = new Map(existingFolders.map((folder) => [folder.slugFolder, folder]));

  const foldersToCreate = [];
  const foldersToUpdate = [];

  for (const folderData of foldersData) {
    const maybeHasTheFolder = existingFolderMap.get(folderData.slugFolder);

    if (maybeHasTheFolder) {
      onProgress?.(
        `[maybe-save-to-mongoDb] Folder already exists in MongoDB: ${folderData.slugFolder}`,
      );
      if (!_.isEqual(maybeHasTheFolder, folderData)) {
        onProgress?.(
          `[maybe-save-to-mongoDb] Folder is updating in MongoDB: ${folderData.slugFolder}`,
        );
        foldersToUpdate.push({
          where: { id: maybeHasTheFolder.id },
          data: folderData,
        });
      }
    } else {
      foldersToCreate.push(folderData);
      onProgress?.(
        `[maybe-save-to-mongoDb] Folder is marked for insertion in MongoDB: ${folderData.slugFolder}`,
      );
    }
  }

  // Realiza as atualizações em lote
  if (foldersToUpdate.length > 0) {
    await Promise.all(foldersToUpdate.map((folder) => prisma.folder.update(folder)));
    onProgress?.(
      `[maybe-save-to-mongoDb] Folders updated in MongoDB. \n  Folders updated: \n ${foldersToUpdate.map((f) => f.data.folderName)}`,
    );
  }

  // Realiza as inserções em lote
  if (foldersToCreate.length > 0) {
    await prisma.folder.createMany({
      data: foldersToCreate,
    });
    onProgress?.(
      `[maybe-save-to-mongoDb] Folders inserted in MongoDB. \n  Folders inserted: \n ${foldersToCreate.map((f) => f.folderName)}`,
    );
  }
}

export async function processFolderStructure(
  folder: drive_v3.Schema$File,
  parentSlug?: string,
  parentName?: string,
  parentId?: string,
  onProgress?: OnProgress,
  allFolders?: FolderStructure[],
) {
  try {
    if (folder.name?.toLowerCase() === 'web') {
      return;
    }

    console.log('[process-folder-structure] Start process of folder: ', folder);

    const currentSlug = createSlug(folder.name!);

    const subItems = await getFoldersByIdOrQuery({
      query: `'${folder.id}' in parents and (mimeType = 'application/vnd.google-apps.folder' or mimeType contains 'image/') and trashed = false`,
      fields: 'files(id, name, mimeType)',
      resParams: { pageSize: 1000 },
    });

    const webFolder = subItems.find((i) => i.name?.toLowerCase() === 'web');
    const hasImages = subItems.find((i) => i.mimeType?.startsWith('image/'));
    const subFolders = subItems.filter(
      (i) =>
        i.mimeType === 'application/vnd.google-apps.folder' && i.name?.toLowerCase() !== 'alta',
    );

    if (webFolder || hasImages) {
      console.log('[process-folder-structure] Add folder to allFolders\n');
      // Pega o id da pasta web ou a pasta que tem imagens
      const folderIdOfPhotos = webFolder ? webFolder.id : hasImages ? folder.id : '';

      // Adiciona a pasta ao array de pastas
      allFolders?.push({
        // Pasta corrente
        folderId: folder.id,
        folderName: folder.name,
        slugFolder: currentSlug,
        folderIdOfPhotos,

        // Pasta pai
        parentId: parentId || '',
        parentName: parentName || '',
        slugParent: parentSlug || '',

        // Mais informações
        thumbId: '',
        usersIds: [],
        createdAt: new Date(),
      } as FolderStructure);
    }

    // Procura recursivamente em subpastas
    for (const subFolder of subFolders) {
      console.log('[process-folder-structure] Start to Process subfolder');
      await processFolderStructure(
        subFolder,
        currentSlug,
        folder.name!,
        folder.id!,
        onProgress,
        allFolders,
      );
    }

    console.log('[process-folder-structure] End process of folder: ', folder);
  } catch (err) {
    console.error(`Error processing folder ${folder.id}:`, err);
    throw {
      message: `Error processing crawler: ${err}`,
      code: 'CRAWLER_ERROR',
    };
  }
}
