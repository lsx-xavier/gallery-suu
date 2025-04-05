'use client';

import { CaretLeft, CaretRight } from '@phosphor-icons/react/dist/ssr';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

import { ImageDto } from '@/entities/image';
import { Button } from '../Button';
import { range } from './utils';

type PortfolioGalleryProps = {
  listOfImages: ImageDto[];
  currentImage: ImageDto | undefined;
  fetchNextImages: () => Promise<void>;
};

export default function Gallery({
  listOfImages,
  currentImage: currentImageProps,
  fetchNextImages,
}: PortfolioGalleryProps) {
  const [currentImage, setCurrentImage] = useState<ImageDto | undefined>(currentImageProps);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [isLoadingMoreImage, setIsLoadingMoreImage] = useState(false);

  const setTheCurrentImage = useCallback(
    (indexOfImage: number) => {
      setIsLoadingImage(true);
      setCurrentImage(listOfImages[indexOfImage]);
    },
    [listOfImages],
  );

  const findIndexOfCurrentImage = listOfImages.findIndex((item) => item.id === currentImage?.id);

  const hasPrevImage = findIndexOfCurrentImage > 0;
  const hasNextImage = findIndexOfCurrentImage < listOfImages.length - 1;
  const prevImage = useCallback(() => {
    if (hasPrevImage) {
      setTheCurrentImage(Number(findIndexOfCurrentImage - 1));
    }
  }, [hasPrevImage, setTheCurrentImage, findIndexOfCurrentImage]);
  const nextImage = useCallback(() => {
    if (findIndexOfCurrentImage === listOfImages.length - 10) {
      setIsLoadingMoreImage(true);

      fetchNextImages().finally(() => {
        setIsLoadingMoreImage(false);
      });
    }

    if (hasNextImage) {
      setTheCurrentImage(Number(findIndexOfCurrentImage + 1));
    }
  }, [
    findIndexOfCurrentImage,
    listOfImages.length,
    hasNextImage,
    fetchNextImages,
    setTheCurrentImage,
  ]);

  useEffect(() => {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') {
        nextImage();
      }

      if (e.key === 'ArrowLeft') {
        prevImage();
      }
    });
  }, [nextImage, prevImage]);

  const filteredImages = listOfImages?.filter((_, index) =>
    range(findIndexOfCurrentImage - 15, findIndexOfCurrentImage + 15).includes(index),
  );

  if (!currentImage) return null;

  return (
    <MotionConfig
      transition={{
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
    >
      <div className="wide:h-full absolute top-1/2 left-1/2 flex max-h-[90%] w-screen max-w-[90%] -translate-x-1/2 -translate-y-1/2 items-center justify-center md:aspect-[3/2] md:max-h-[75%]">
        {hasPrevImage && (
          <Button
            onClick={prevImage}
            className="absolute top-1/2 left-4 -translate-y-1/2 !rounded-full"
            variant="primary"
          >
            <CaretLeft className="text-2xl text-white" />
          </Button>
        )}

        {isLoadingImage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-[#8e8e8e]"></div>
          </div>
        )}

        <Image
          src={(currentImage?.webContentLink as string).replaceAll('=download', '=view')}
          alt={currentImage?.name || ''}
          className="max-h-[100%] object-contain"
          quality={50}
          objectFit="fill"
          width={Number(currentImage?.imageMediaMetadata?.width) || 1920}
          height={Number(currentImage?.imageMediaMetadata?.height) || 1080}
          priority
          onLoadingComplete={() => setIsLoadingImage(false)}
        />

        {hasNextImage && (
          <Button
            onClick={nextImage}
            className="absolute top-1/2 right-4 -translate-y-1/2 !rounded-full"
            variant="primary"
            isLoading={isLoadingMoreImage}
          >
            <CaretRight className="text-2xl text-white" />
          </Button>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 overflow-hidden">
        <motion.div initial={false} className="mx-auto my-6 flex aspect-[3/2] h-16">
          <AnimatePresence initial={false}>
            {filteredImages.map(({ id, webContentLink, name }) => {
              const indexOfCurrentImage = filteredImages.findIndex(
                (item) => item.id === currentImage.id,
              );

              return (
                <motion.button
                  key={id}
                  initial={{
                    width: '0%',
                    x: `${Math.max((indexOfCurrentImage - 1 - 1) * -100, 15 * -100)}%`,
                  }}
                  animate={{
                    scale: id === currentImage.id ? 1.25 : 1,
                    width: '100%',
                    x: `${Math.max(indexOfCurrentImage * -100, 15 * -100)}%`,
                  }}
                  exit={{ width: '0%' }}
                  onClick={() => setTheCurrentImage(indexOfCurrentImage)}
                  className={`relative flex w-full shrink-0 transform-gpu items-center justify-center overflow-hidden focus:outline-none ${indexOfCurrentImage - 1 === 0 ? 'rounded-l-md' : ''} ${id === listOfImages[listOfImages.length - 1].id ? 'rounded-r-md' : ''} ${id === currentImage.id ? 'z-10 rounded-md shadow shadow-black/50' : ''}`}
                >
                  <Image
                    className={`${
                      id === currentImage.id
                        ? 'brightness-110 hover:brightness-110'
                        : 'brightness-50 contrast-125 hover:brightness-75'
                    } h-auto !max-h-[auto] w-full`}
                    alt={name}
                    title={name}
                    src={(webContentLink as string).replaceAll('=download', '=view')}
                    objectFit="cover"
                    width={600}
                    height={337}
                    quality={30}
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                    }}
                  />
                </motion.button>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </MotionConfig>
  );
}
