export type FolderStructure = {
  id: string;
  name: string;
  hasImages: boolean;
  webFolderId?: string;
  slug: string;
  parentSlug?: string;
}

export type OnProgress = (message: string) => void;