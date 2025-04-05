'use server';

import { getFolderById } from '@/app/(admin)/admin/pastas/action';
import { driveWithAuth } from '@/(infra)/config/apis/google';

export async function getImagesByFolderPaginated(
  folderId: string,
  limit: number,
  nextPageTokenParam: string | undefined = undefined,
) {
  const folder = await getFolderById(folderId);

  if (!folder) {
    throw new Error('Folder not found');
  }

  const drive = await driveWithAuth();
  const { photos, nextPageToken } = await drive.files
    .list({
      q: `'${folder.folderIdOfPhotos}' in parents and mimeType contains 'image/'`,
      fields: 'files(id, name, webContentLink, imageMediaMetadata), nextPageToken',
      pageSize: limit,
      pageToken: nextPageTokenParam,
    })
    .then((res) => {
      if (!res) {
        throw new Error(`Didn\'t get response from the drive folder: ${folder.folderName}`);
      }

      if (res.data.files?.length === 0) {
        throw new Error(`Didn\'t find any photos in the folder: ${folder.folderName}`);
      }

      console.log(res.data.files);
      return {
        photos: res.data.files,
        nextPageToken: res.data.nextPageToken,
      };
    });

  return {
    photos,
    nextPageToken,
  };
}

export async function getAllImagesByFolder(folderId: string) {
  const folder = await getFolderById(folderId);

  if (!folder) {
    throw new Error('Folder not found');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let allImages: any[] = [];

  const drive = await driveWithAuth();

  let nextPageToken: string | undefined | null = undefined;
  while (nextPageToken !== 'FINISHED') {
    await drive.files
      .list({
        q: `'${folder.folderIdOfPhotos}' in parents and mimeType contains 'image/'`,
        fields: 'files(id, name, webContentLink, imageMediaMetadata), nextPageToken',
        pageSize: 1000,
        pageToken: nextPageToken,
      })
      .then((res) => {
        if (!res) {
          throw new Error(`Didn\'t get response from the drive folder: ${folder.folderName}`);
        }

        if (res.data.files?.length === 0) {
          throw new Error(`Didn\'t find any photos in the folder: ${folder.folderName}`);
        }

        allImages = [...allImages, ...(res.data.files || [])];

        console.log('getAllImagesByFolder', nextPageToken, res.data.nextPageToken);

        if (typeof res.data.nextPageToken === 'string') {
          nextPageToken = res.data.nextPageToken;
        } else {
          nextPageToken = 'FINISHED';
        }
      });
  }

  return allImages;
}
