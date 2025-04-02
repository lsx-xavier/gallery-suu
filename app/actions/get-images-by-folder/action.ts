'use server'

import { getFolderById } from "@/app/(admin)/admin/pastas/action";
import { driveWithAuth } from "@/config/apis/google";

export async function getImagesByFolder(folderId: string, limit: number, nextPageTokenParam: string | undefined = undefined) {
    const folder = await getFolderById(folderId)

    if (!folder) {
        return {
            error: "Folder not found"
        }
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
              throw {
                  message: `Didn\'t get response from the drive folder: ${folder.folderName}`,
                  status: 500,
                };
            }
            
            if (res.data.files?.length === 0) {
                throw {
                    message: `Didn\'t find any photos in the folder: ${folder.folderName}`,
                    status: 500,
                };
            }
            
            console.log(res.data.files)
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