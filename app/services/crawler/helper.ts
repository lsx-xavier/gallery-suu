import { getFoldersByIdOrQuery } from "@/config/apis/google";
import { createSlug } from "@/utils/create-slug";
import { drive_v3 } from "googleapis";
import { saveToRedis } from "../save-to-redis";
import { OnProgress } from "./types";

export async function processFolderStructure(
  folder: drive_v3.Schema$File,
  parentSlug?: string,
  onProgress?: OnProgress
) {
  try {
    if (folder.name?.toLowerCase() === 'web') {
      return;
    }

    const currentSlug = createSlug(folder.name!);

    const subItems = await getFoldersByIdOrQuery({
      query: `'${folder.id}' in parents and (mimeType = 'application/vnd.google-apps.folder' or mimeType contains 'image/') and trashed = false`,
      fields: 'files(id, name, mimeType)',
      resParams: { pageSize: 1000 }
    });

    const webFolder = subItems.find(i => i.name?.toLowerCase() === 'web');
    const hasImages = subItems.some(i => i.mimeType?.startsWith("image/"));
    const subFolders = subItems.filter(i =>
      i.mimeType === "application/vnd.google-apps.folder" &&
      i.name?.toLowerCase() !== 'alta'
    );

    // Se encontrou pasta WEB
    if (webFolder || hasImages) {
      const redisKey = parentSlug
        ? `folder:${parentSlug}:${currentSlug}`
        : `folder:${currentSlug}`;

      const folderStructure = {
        id: folder.id!,
        name: folder.name!,
        hasImages: !!hasImages,
        ...((webFolder && webFolder.id) && { webFolderId: webFolder.id }),
      };

      await saveToRedis(redisKey, folderStructure, onProgress);

    }

    // Procura recursivamente em subpastas
    for (const subFolder of subFolders) {
      await processFolderStructure(subFolder, currentSlug, onProgress);
    }

  } catch (err) {
    console.error(`Error processing folder ${folder.id}:`, err);
    throw {
      message: `Error processing crawler: ${err}`,
      code: 'CRAWLER_ERROR'
    };
  }
}