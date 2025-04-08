'use client';

import { getAllImagesByFolder } from '@/app/_shared/actions/get-images-by-folder/action';
import useDebounce from '@/infra/hooks/use-debounce/use-debounce';
import { removeImgExtension } from '@/infra/utils/remove-img-extensions';
import { ShimmerImage } from '@/infra/utils/shimmer-image';
import Image from 'next/image';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { FoldersWithUsers, updateFolderInfosProps } from '../../action';

type ThumbGalleryProps = {
  folder: FoldersWithUsers;
  onSelect: Dispatch<SetStateAction<updateFolderInfosProps['photo'] | undefined>>;
};

export function ThumbGallery({ folder, onSelect }: ThumbGalleryProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [photos, setPhotos] = useState<any[]>([]);
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(true);

  const [selectedPhotos, setSelectedPhotos] = useState<string>(folder.thumbFolder?.photoName || '');
  const selectedNamePhotoBounced = useDebounce(selectedPhotos, 800);
  const [selectedPhoto, setSelectedPhoto] = useState<
    updateFolderInfosProps['photo']['photoUrl'] | undefined
  >(folder.thumbFolder?.photoUrl || undefined);
  const [isLoadingSelectedPhoto, setIsLoadingSelectedPhoto] = useState(false);

  useEffect(() => {
    const fetchPhotos = async () => {
      setIsLoadingPhotos(true);
      await getAllImagesByFolder(folder.id).then((allPhotos) => {
        setPhotos(allPhotos);
        setIsLoadingPhotos(false);
      });
    };

    try {
      fetchPhotos();
    } catch (err) {
      console.error(err);
    }
  }, [folder]);

  useEffect(() => {
    if (selectedNamePhotoBounced === '' || photos.length === 0) return;
    setIsLoadingSelectedPhoto(true);

    const findedPhoto = photos.find(
      (photo) => removeImgExtension(selectedNamePhotoBounced) === removeImgExtension(photo.name),
    );

    if (!findedPhoto) {
      setIsLoadingSelectedPhoto(false);
      setSelectedPhoto(undefined);

      return;
    }

    setSelectedPhoto(findedPhoto.webContentLink.replaceAll('=download', '=view'));
    onSelect({
      photoId: findedPhoto.id,
      photoName: findedPhoto.name,
      photoUrl: findedPhoto.webContentLink.replaceAll('=download', '=view'),
    });

    setIsLoadingSelectedPhoto(false);
  }, [isLoadingPhotos, onSelect, photos, selectedNamePhotoBounced]);

  return (
    <div className="flex gap-2">
      <div className="flex w-full flex-col gap-2">
        <h6 className="text-sm font-bold">Capa</h6>

        <div className="flex items-start gap-2">
          <input
            id="selectedPhoto"
            type="text"
            name="selectedPhoto"
            value={selectedPhotos}
            placeholder="Digite o nome da foto"
            onChange={(e) => setSelectedPhotos(e.target.value)}
            className="rounded-md border border-gray-300 p-2"
          />

          <div className="relative flex items-center justify-center">
            {isLoadingSelectedPhoto && (
              <p className="mt-1 text-center text-xs text-gray-300">Carregando Foto...</p>
            )}

            {!isLoadingSelectedPhoto && selectedNamePhotoBounced.trim() !== '' && selectedPhoto ? (
              <Image
                src={selectedPhoto}
                alt={'Suuk foto'}
                className="relative aspect-square w-[100px] rounded-lg object-cover"
                width={1920}
                height={1080}
                quality={50}
                placeholder={`data:image/svg+xml;base64,${ShimmerImage(1920, 1080)}`}
              />
            ) : !isLoadingSelectedPhoto &&
              selectedNamePhotoBounced.trim() !== '' &&
              !selectedPhoto ? (
              <p className="mt-1 text-center text-xs text-red-300">Foto não encontrada</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
