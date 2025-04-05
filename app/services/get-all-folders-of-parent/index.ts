import { redis } from '@/config/redis';
import { Folder } from '@/entities/folder';
import { createSlug } from '@/utils/create-slug';

export default async function getAllFoldersOfParent(parent: string) {
  try {
    const all = await redis.keys('folder:*');

    const pipeline = redis.pipeline();
    all.forEach((key) => pipeline.hgetall(key));
    const results = await pipeline.exec();

    if (!results) {
      throw {
        message: "Didn't find any subfolder",
        status: 404,
      };
    }

    const parentSlug = createSlug(parent);

    // Filtra os resultados pelo parentSlug
    const childFolders = results
      .map((data: Folder) => {
        if (!data || data.parentSlug !== parentSlug) return null;
        return {
          ...data,
        };
      })
      .filter(Boolean);

    return childFolders;
  } catch (error) {
    throw {
      message: 'Error getting all folders of parent',
      status: 500,
    };
  }
}
