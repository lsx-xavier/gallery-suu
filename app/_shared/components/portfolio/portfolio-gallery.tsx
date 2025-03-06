'use client';

import { CaretLeft, CaretRight, X } from '@phosphor-icons/react/dist/ssr';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useState } from 'react';

// @ts-expect-error - just to avoid type error
import useKeypress from 'react-use-keypress';


import { ImageDto } from '@/entities/image';
import { range } from './utils';

type PortfolioGalleryProps = {
  listOfImages: ImageDto[];
  currentImage: ImageDto;
  fetchNextImages: () => void;
};

export default function Gallery({ listOfImages, currentImage: currentImageProps,  fetchNextImages}: PortfolioGalleryProps) {
  const [currentImage, setCurrentImage] = useState<ImageDto>(currentImageProps);
  const [isLoadingImage, setIsLoadingImage] = useState(true);

  const setTheCurrentImage = useCallback((indexOfImage: number) => {
    setIsLoadingImage(true);
    setCurrentImage(listOfImages[indexOfImage]);
  }, [listOfImages]);

  const findIndexOfCurrentImage = !currentImage ? 0 : listOfImages.findIndex(
    (item) => item.id === currentImage.id
  );

  const hasPrevImage = findIndexOfCurrentImage > 0;
  const hasNextImage = findIndexOfCurrentImage < listOfImages.length - 1;
  const prevImage = useCallback(
    () => {
      
      if(hasPrevImage)  {
        setTheCurrentImage(Number(findIndexOfCurrentImage - 1))
      }
    },
    [hasPrevImage, setTheCurrentImage, findIndexOfCurrentImage]
  );
  const nextImage = useCallback(
    () => {
      if(findIndexOfCurrentImage === listOfImages.length - 3) {
        fetchNextImages();
      }

      if(hasNextImage)  {
        setTheCurrentImage(Number(findIndexOfCurrentImage + 1))
      }
    },
    [findIndexOfCurrentImage, listOfImages.length, hasNextImage, fetchNextImages, setTheCurrentImage]
  );

  useKeypress('ArrowRight', nextImage);
  useKeypress('ArrowLeft', prevImage);

  const filteredImages = listOfImages?.filter((img: ImageDto) =>
    range(findIndexOfCurrentImage - 15, findIndexOfCurrentImage + 15).includes(findIndexOfCurrentImage)
  );

  return (
    <MotionConfig
      transition={{
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
    >
      <div className="wide:h-full xl:taller-than-854:h-auto absolute left-1/2 top-1/2 z-20 aspect-[3/2] w-screen max-w-7xl -translate-x-1/2 -translate-y-1/2 items-center max-h-[95%]">
        <Dialog.Close className="absolute right-2 top-2 z-20 rounded-full bg-suuk-3 bg-opacity-75 p-2 hover:bg-opacity-100 [&>*]:hover:opacity-60">
          <X className="text-2xl text-white" />
        </Dialog.Close>

        {hasPrevImage && (
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 z-[2] -translate-y-1/2 rounded-full bg-suuk-3 bg-opacity-75 p-2 hover:bg-opacity-100 [&>*]:hover:opacity-60"
          >
            <CaretLeft className="text-2xl text-white" />
          </button>
        )}

        {isLoadingImage && (
          <div className="absolute inset-0 z-[2] flex items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-[#8e8e8e]"></div>
          </div>
        )}

        <Image
          src={(currentImage?.webContentLink as string).replaceAll("=download", '=view')}
          alt={currentImage?.name || ''}
          className="z-[1] object-contain max-h-[100%]"
          quality={100}
          objectFit='fill'
          width={Number(currentImage?.imageMediaMetadata?.width) || 1920}
          height={Number(currentImage?.imageMediaMetadata?.height) || 1080}
          
          priority 
          onLoadingComplete={() => setIsLoadingImage(false)}
        />

        {hasNextImage && (
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 z-[2] -translate-y-1/2 rounded-full bg-suuk-3 bg-opacity-75 p-2 hover:bg-opacity-100 [&>*]:hover:opacity-60"
          >
            <CaretRight className="text-2xl text-white" />
          </button>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 overflow-hidden">
        <motion.div
          initial={false}
          className="mx-auto my-6 flex aspect-[3/2] h-24"
        >
          <AnimatePresence initial={false}>
            {filteredImages.map(({ id, webContentLink,  name }, index) => (
              <motion.button
                initial={{
                  width: '0%',
                  x: `${Math.max((Number(currentImage.id) - 1 - 1) * -100, 15 * -100)}%`,
                }}
                animate={{
                  scale: id === currentImage.id ? 1.25 : 1,
                  width: '100%',
                  x: `${Math.max(Number(currentImage.id) * -100, 15 * -100)}%`,
                }}
                exit={{ width: '0%' }}
                onClick={() => setTheCurrentImage(index)}
                key={id}
                className={`${
                  id === currentImage.id
                    ? 'z-20 rounded-md shadow shadow-black/50'
                    : 'z-10'
                } ${Number(id) - 1 === 0 ? 'rounded-l-md' : ''} ${
                  id === listOfImages[listOfImages.length - 1].id
                    ? 'rounded-r-md'
                    : ''
                } relative flex w-full shrink-0 transform-gpu items-center justify-center overflow-hidden focus:outline-none`}
              >
                <Image
                  className={`${
                    id === currentImage.id
                      ? 'brightness-110 hover:brightness-110'
                      : 'brightness-50 contrast-125 hover:brightness-75'
                  } h-auto !max-h-[auto] w-full`}
                  alt={name}
                  title={name}
                  src={(webContentLink as string).replaceAll("=download", '=view')}
                  objectFit="cover"

                  width={600}
                  height={337}
                  quality={40}
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                  }}
                />
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </MotionConfig>
  );
}
