export interface Folder {
  id: string;
  name: string;
  child?: Folder[];
}

export interface FolderRouterDto {
  folders: string[];
}

export interface FolderRouteParams {
  params: Promise<FolderRouterDto>;
}

export type TokenFolderPage = string | undefined;
