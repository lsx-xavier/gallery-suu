export interface ImageDto {
  id: string;
  name: string;
  webContentLink: string;
  webViewLink: string;

  imageMediaMetadata?: {
    width: string;
    height: string;
    rotation: string;
  };
}
