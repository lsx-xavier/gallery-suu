import { driveWithAuth } from '@/config/apis/google';
import prisma from '@/config/primsa';
import { createSlug } from '@/utils/create-slug';

export default async function getPhotosFromTargetFolder(
  foldersToSearch: string | null,
  limit: number,
  nextPageTokenParam: string | undefined = undefined,
) {
  try {
    if (!foldersToSearch || foldersToSearch.length === 0) {
      throw {
        message: 'targetFolder or parentFolder is required',
        status: 400,
      };
    }

    const folders = JSON.parse(foldersToSearch);

    const targetFolder = folders[folders.length - 1];
    const parentFolder = folders[0];

    const targetFolderSlug = createSlug(targetFolder || parentFolder);
    const parentFolderSlug = createSlug(parentFolder);
    const findedFolder = await prisma.folder.findFirst({
      where: {
        slugFolder: targetFolderSlug,
        ...(parentFolderSlug ? { slugParent: parentFolderSlug } : {}),
      },
    });

    if (!findedFolder) {
      throw {
        message: 'Folder not found on DB',
        status: 404,
      };
    }

    const drive = await driveWithAuth();
    const { photos, nextPageToken } = await drive.files
      .list({
        q: `'${findedFolder.folderIdOfPhotos}' in parents and mimeType contains 'image/'`,
        fields: 'files(id, name, webContentLink, imageMediaMetadata), nextPageToken',
        pageSize: limit,
        pageToken: nextPageTokenParam,
      })
      .then((res) => {
        if (!res) {
          throw {
            message: `Didn\'t get response from the drive folder: ${findedFolder.folderName}`,
            status: 500,
          };
        }

        if (res.data.files?.length === 0) {
          throw {
            message: `Didn\'t find any photos in the folder: ${findedFolder.folderName}`,
            status: 500,
          };
        }

        return {
          photos: res.data.files,
          nextPageToken: res.data.nextPageToken,
        };
      });

    return {
      photos,
      nextPageToken,
    };
  } catch (error) {
    return {
      error: error.message,
      status: error.status,
    };
  }
}
