import { getFoldersByIdOrQuery } from "@/config/apis/google";
import { createSlug } from "@/utils/create-slug";
import { drive_v3 } from "googleapis";
import { saveToRedis } from "../save-to-redis";
import { FolderStructure, OnProgress } from "./types";

export async function processFolderStructure(
  folder: drive_v3.Schema$File,
  parentSlug?: string,
  onProgress?: OnProgress
): Promise<FolderStructure | null> {
  try {
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
    if (webFolder) {
      const folderStructure = {
        id: folder.id!,
        name: folder.name!,
        hasImages: true,
        webFolderId: webFolder.id!,
        slug: currentSlug,
        ...{ parentSlug }
      };

      await saveToRedis(folderStructure, onProgress);
      return folderStructure;
    }

    // Se tem imagens diretas
    if (hasImages) {
      const folderStructure = {
        id: folder.id!,
        name: folder.name!,
        hasImages: true,
        slug: currentSlug,
        ...{ parentSlug }
      };

      await saveToRedis(folderStructure, onProgress);
      return folderStructure;
    }

    // Procura recursivamente em subpastas
    for (const subFolder of subFolders) {
      const result = await processFolderStructure(subFolder, currentSlug, onProgress);
      if (result) return result;
    }

    return null;
  } catch (err) {
    console.error(`Error processing folder ${folder.id}:`, err);
    return null;
  }
}