import { redis } from '@/(infra)/config/redis';

type GalleryFolder = {
  id: string; // ID da pasta de imagens ou webFolderId
  name: string; // Nome original da pasta
  parentSlug?: string; // Slug do pai (se houver)
};

export async function getFolderIdImage(path: string): Promise<GalleryFolder | null> {
  try {
    console.log({ path });
    // Converte o path em slug
    const currentSlug = path
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');

    // Busca a pasta no Redis
    const folderKey = `folder:${currentSlug}`;
    const folderData = await redis.hgetall(folderKey);
    const allFolders = await redis.keys('*');
    console.log({ allFolders });

    if (!Object.keys(folderData).length) return null;

    // Retorna o ID apropriado (webFolderId tem prioridade)
    return {
      id: folderData.webFolderId || folderData.id,
      name: folderData.name,
      parentSlug: folderData.parentSlug || undefined,
    };
  } catch (err) {
    console.error(`[gallery-SERVICE] Redis get error for path ${path}:`, err);
    return null;
  }
}
