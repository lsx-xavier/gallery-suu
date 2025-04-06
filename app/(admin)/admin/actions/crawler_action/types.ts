import { Folder } from '@prisma/client';
import { drive_v3 } from 'googleapis';

export type ParentInfoForFolderDB = {
  slugParent: string;
  parentName: string;
  parentId: string;
};

export type FolderOfPhotosOrWeb = {
  webFolder: drive_v3.Schema$File | undefined;
  hasImages: drive_v3.Schema$File | undefined;
  subFolders: drive_v3.Schema$File[] | undefined;
};

export type BatchOperationResult = {
  success: boolean;
  count: number;
  operation: 'create' | 'update';
  error?: string;
};

export type MaybeSaveOnDBProps = {
  foldersData: Folder[];
  onProgress?: OnProgress;
};

export type OnProgress = (message: string) => void;

export type ProcessFolderStructureProps = {
  folder: drive_v3.Schema$File;
  allFolders: Folder[];
  onProgress?: OnProgress;
  parentInfo?: {
    slugParent: string;
    parentName: string;
    parentId: string;
  };
};
