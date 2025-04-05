export function getApiFecthForImages({ folders }: { folders: string[] }, nextPageProps?: string) {
  let url = `/get-images-from?limit=18&targetFolder=${folders[folders.length - 1]}`;

  if (nextPageProps) {
    url = url.concat(`&nextPageToken=${nextPageProps}`);
  }

  return url;
}
