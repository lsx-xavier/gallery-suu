import { redis } from '@/config/redis';
import { FolderStructure, OnProgress } from '../crawler/types';

export async function saveToRedis(
  redisKey: string,
  folderData: FolderStructure,
  onProgress?: OnProgress,
) {
  try {
    const hasFolder = await redis.exists(redisKey);
    if (hasFolder) {
      console.log('[crawler-SERVICE] Folder already exists in Redis:', redisKey);
      return;
    }

    console.log('[crawler-SERVICE] Saving folder to Redis:', redisKey, folderData);
    await redis.hset(redisKey, folderData);

    await redis.hset('crawler:status', {
      lastFolder: redisKey,
      timestamp: new Date().toISOString(),
    });

    onProgress?.(`[crawler-SERVICE] Saved folder to Redis: ${redisKey}`);
  } catch (err) {
    onProgress?.(`[crawler-SERVICE] Redis save error for ${redisKey}: ${err}`);
  }
}
