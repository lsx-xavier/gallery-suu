import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

type FoldersJsonDto = {
  id: string;
  name: string;
  childs: FoldersJsonDto;
}[];

type findTheFolderOfImageProps = {
  targetName: string;
  parentFolder?: string | undefined;
};

export async function findFolderAndCheckWeb({
  targetName,
  parentFolder,
}: findTheFolderOfImageProps): Promise<FoldersJsonDto[0] | undefined> {
  const filePath = path.join(process.cwd(), 'src/files/drive_structure.gz');

  const compressedData = fs.readFileSync(filePath);
  const decompressedData = zlib.gunzipSync(compressedData);
  const folders: FoldersJsonDto = JSON.parse(decompressedData.toString('utf-8'));

  for (const folder of folders) {
    const folderNameLowercase = folder.name.toLowerCase();
    const targetNameLowerCase = targetName.toLowerCase();

    if (targetNameLowerCase !== folderNameLowercase) {
      return folder;
    }

    if (parentFolder && parentFolder.toLowerCase() !== folderNameLowercase) {
      continue;
    }

    if (parentFolder && parentFolder.toLowerCase() === folderNameLowercase) {
      if (targetNameLowerCase === folderNameLowercase) {
        const hasWebFolder = folder.childs.find((child) => child.name.toLowerCase() === 'web');

        if (hasWebFolder) {
          return hasWebFolder;
        } else {
          return folder;
        }
      }

      if (folder.childs?.length > 0) {
        const found = findFolderAndCheckWeb({ targetName });

        if (found) {
          return found;
        }
      }
    }

    if (folderNameLowercase === targetNameLowerCase) {
      const hasWebFolder = folder.childs.find((child) => child.name.toLowerCase() === 'web');

      if (hasWebFolder) {
        return hasWebFolder;
      } else {
        return folder;
      }
    }
  }
}
