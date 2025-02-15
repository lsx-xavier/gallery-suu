import { FolderRouterDto, TokenFolderPage } from "@/entities/folder"

export function getApiFecthForImages({folders}: FolderRouterDto, nextPageProps?: TokenFolderPage) {

  let url = `/get-images-from?limit=18`
  if(nextPageProps) {
    url = url.concat(`&nextPageToken=${nextPageProps}`)
  }
  if(folders.length > 1) {
    url = url.concat(`&parentFolder=${folders[0]}&targetFolder=${folders[folders.length - 1]}`)
  } else {
    url = url.concat(`&targetFolder=${folders[0]}`)
  }

  return url
}