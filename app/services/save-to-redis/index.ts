import { redis } from "@/config/redis";
import { FolderStructure, OnProgress } from "../crawler/types";

export async function saveToRedis(folder: FolderStructure, onProgress?: OnProgress) {
  try {
    // Salva a estrutura usando o slug como chave
    const folderKey = `folder:${folder.slug}`;

    const hasFolder = await redis.exists(folderKey);
    if (hasFolder) {
      console.log('[crawler-SERVICE] Folder already exists in Redis:', folderKey);
      return;
    }

    // Objeto com valores validados
    const folderData = {
      id: folder.id || '',
      name: folder.name || '',
      hasImages: folder.hasImages ? '1' : '0',
      webFolderId: folder.webFolderId || '',
      slug: folder.slug || '',
      parentSlug: folder.parentSlug || ''
    };

    // Verifica se os campos obrigatórios existem
    if (!folderData.id || !folderData.name || !folderData.slug || !folderKey || !folderData.hasImages) {
      console.error(`[crawler-SERVICE] Invalid folder data:`, folder);
      return;
    }

    console.log('[crawler-SERVICE] Saving folder to Redis:', folderKey, folderData);
    await redis.hset(folderKey, folderData);

    await redis.hset('crawler:status', {
      lastFolder: folder.name,
      timestamp: new Date().toISOString()
    });

    onProgress?.(`[crawler-SERVICE] Saved folder to Redis: ${folder.slug}`);
  } catch (err) {
    onProgress?.(`[crawler-SERVICE] Redis save error for ${folder.slug}: ${err}`,);
  }
}