export type FolderStructure = {
  folderName: string;
  parentId: string;
  parentName: string;
  folderIdOfPhotos: string;
  thumbId: string;
  usersIds: string[];
  createdAt: Date;
  folderId: string;
  slugFolder: string;
  slugParent: string;
}

export type OnProgress = (message: string) => void;

export type maybeSaveToMongoDbProps = {
  foldersData: FolderStructure[];
  onProgress?: OnProgress
}