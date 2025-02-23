import { getFoldersByIdOrQuery } from "@/config/apis/google";
import { redis } from "@/config/redis";
import { drive_v3 } from "googleapis";

type FolderStructure = {
  id: string;
  name: string;
  hasImages: boolean;
  webFolderId?: string;
  slug: string;
  parentSlug?: string;
}

async function processFolderStructure(
  folder: drive_v3.Schema$File,
  parentSlug?: string
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
        parentSlug
      };

      await saveToRedis(folderStructure);
      return folderStructure;
    }

    // Se tem imagens diretas
    if (hasImages) {
      const folderStructure = {
        id: folder.id!,
        name: folder.name!,
        hasImages: true,
        slug: currentSlug,
        parentSlug
      };

      await saveToRedis(folderStructure);
      return folderStructure;
    }

    // Procura recursivamente em subpastas
    for (const subFolder of subFolders) {
      const result = await processFolderStructure(subFolder, currentSlug);
      if (result) return result;
    }

    return null;
  } catch (err) {
    console.error(`Error processing folder ${folder.id}:`, err);
    return null;
  }
}

function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

async function saveToRedis(folder: FolderStructure) {
  try {
    // Salva a estrutura usando o slug como chave
    const folderKey = `folder:${folder.slug}`;

    await redis.hset(folderKey, {
      id: folder.id,
      name: folder.name,
      hasImages: folder.hasImages ? '1' : '0',
      webFolderId: folder.webFolderId || '',
      slug: folder.slug,
      parentSlug: folder.parentSlug || ''
    });

    console.log(`[crawler-SERVICE] Saved folder to Redis: ${folder.slug}`);
  } catch (err) {
    console.error(`[crawler-SERVICE] Redis save error for ${folder.slug}:`, err);
  }
}

export async function crawlerTheFolders() {
  try {
    const folderId = process.env.LINK_CLIENTES_FOLDER_ID;
    console.log('[crawler-SERVICE] start');

    const parentFolders = await getFoldersByIdOrQuery({
      folderId: folderId!,
      fields: 'files(id, name, mimeType)'
    });

    for (const parent of parentFolders) {
      if (!parent.id || parent.name?.toLowerCase() === 'web') continue;

      await processFolderStructure(parent);
    }

    console.log('[crawler-SERVICE] Processed folders finished');
  } catch(error) {
    console.error('[crawler-SERVICE] Error:', error);
    throw error;
  }
}