'use client';

import { getAllImagesByFolder } from '@/app/_shared/actions/get-images-by-folder/action';
import { removeImgExtension } from '@/app/_shared/utils/remove-img-extensions';
import useDebounce from '@/hooks/useDebounce';
import { ShimmerImage } from '@/utils/ShimmerImage';
import Image from 'next/image';
import { useEffect, useState } from 'react';

type ThumbGalleryProps = {
  folderId: string;
  onSelect: (linkPhoto: string) => void;
};

export function ThumbGallery({ folderId, onSelect }: ThumbGalleryProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [photos, setPhotos] = useState<any[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);

  const [selectedPhotos, setSelectedPhotos] = useState<string>('');
  const selectedNamePhotoBounced = useDebounce(selectedPhotos, 800);
  const [selectedPhoto, setSelectedPhoto] = useState<
    { webContentLink: string; name: string } | undefined
  >(undefined);
  const [isLoadingSelectedPhoto, setIsLoadingSelectedPhoto] = useState(false);

  useEffect(() => {
    const fetchPhotos = async () => {
      setIsLoadingPhotos(true);
      await getAllImagesByFolder(folderId).then((allPhotos) => {
        setPhotos(allPhotos);
        setIsLoadingPhotos(false);
      });
    };

    try {
      fetchPhotos();
    } catch (err) {
      console.error(err);
    }
  }, [folderId]);

  useEffect(() => {
    if (selectedNamePhotoBounced === '' || photos.length === 0) return;
    setIsLoadingSelectedPhoto(true);

    const findedPhoto = photos.find(
      (photo) => removeImgExtension(photo.name) === removeImgExtension(selectedNamePhotoBounced),
    );

    setSelectedPhoto({
      webContentLink: findedPhoto.webContentLink.replaceAll('=download', '=view'),
      name: findedPhoto.name,
    });
    onSelect(findedPhoto.webContentLink.replaceAll('=download', '=view'));

    setIsLoadingSelectedPhoto(false);
  }, [isLoadingPhotos, onSelect, photos, selectedNamePhotoBounced]);

  return (
    <div className="flex gap-2">
      <div className="flex flex-col gap-2 w-full">
        <h6 className="text-sm font-bold">Capa</h6>

        <div className="flex gap-2 items-start">
          <input
            id="selectedPhoto"
            type="text"
            name="selectedPhoto"
            value={selectedPhotos}
            placeholder="Digite o nome da foto"
            onChange={(e) => setSelectedPhotos(e.target.value)}
            className="p-2 border border-gray-300 rounded-md"
          />

          <div className="flex items-center justify-cente">
            {isLoadingSelectedPhoto && (
              <p className="text-center text-gray-300 text-xs mt-1">Carregando Foto...</p>
            )}

            {!isLoadingSelectedPhoto && selectedNamePhotoBounced.trim() !== '' && selectedPhoto ? (
              <Image
                src={selectedPhoto.webContentLink}
                alt={selectedPhoto.name || 'Suuk foto'}
                className="w-auto rounded-lg !relative !h-[100px]"
                objectFit="cover"
                width={1920}
                height={1080}
                quality={50}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  maxHeight: '90%',
                }}
                placeholder={`data:image/svg+xml;base64,${ShimmerImage(1920, 1080)}`}
              />
            ) : !isLoadingSelectedPhoto &&
              selectedNamePhotoBounced.trim() !== '' &&
              !selectedPhoto ? (
              <p className="text-center text-red-300 text-xs mt-1">Foto não encontrada</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
