import httpClient from '@/(infra)/config/httpClient';

export default function handleDownloadPhotos({
  folderId,
  photoId,
}: {
  folderId: string;
  photoId: string | undefined;
}) {
  httpClient.get({
    url: '/download-image',
    params: {
      folderId,
      photoId,
    },
  });
}
