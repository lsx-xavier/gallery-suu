import { driveWithAuth } from "@/config/apis/google";
import { redis } from "@/config/redis";
import { createSlug } from "@/utils/create-slug";

export default async function getPhotosFromTargetFolder(targetFolder: string | null, limit: number, nextPageTokenParam: string | undefined = undefined) {
  try {
    if (!targetFolder) {
      throw {
        message: 'targetFolder or parentFolder is required',
        status: 400
      }
    }

    const targetFolderSlug = createSlug(targetFolder);
    const status = await redis.hgetall(`folder:${targetFolderSlug}`);

    if (!status) {
      throw {
        message: 'Folder not found on DB',
        status: 404
      }
    }

    const folderId = (status.webFolderId as string).length > 0 ? status.webFolderId : status.id;

    const drive = await driveWithAuth();
    const { photos, nextPageToken } = await drive.files.list({
      q: `'${folderId}' in parents and mimeType contains 'image/'`,
      fields: 'files(id, name, webContentLink, imageMediaMetadata), nextPageToken',
      pageSize: limit,
      pageToken: nextPageTokenParam
    }).then((res) => {
      if (!res) {
        throw {
          message: `Didn\'t get response from the drive folder: ${status.name}`,
          status: 500
        }
      }

      if (!res.data.files || res.data.files?.length === 0) {
        throw {
          message: `Didn\'t find any photos in the folder: ${status.name}`,
          status: 500
        }
      }

      return {
        photos: res.data.files,
        nextPageToken: res.data.nextPageToken
      };
    });


    return {
      photos,
      nextPageToken
    }
  } catch (error) {
    return {
      error: error.message,
      status: error.status
    }
  }
} 