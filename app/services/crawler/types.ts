export type FolderStructure = {
  id: string;
  name: string;
  hasImages: boolean;
  webFolderId?: string;
}

export type OnProgress = (message: string) => void;