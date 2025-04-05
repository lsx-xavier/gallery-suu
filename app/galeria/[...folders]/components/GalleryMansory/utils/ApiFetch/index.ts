import { FolderRouterDto, TokenFolderPage } from '@/entities/folder';

export function getApiFecthForImages(
  { folders }: FolderRouterDto,
  nextPageProps?: TokenFolderPage,
) {
  let url = `/get-images-from?limit=18&targetFolder=${folders[folders.length - 1]}`;

  if (nextPageProps) {
    url = url.concat(`&nextPageToken=${nextPageProps}`);
  }

  return url;
}
