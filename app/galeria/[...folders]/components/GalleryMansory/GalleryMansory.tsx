'use client'
import { Button } from '@/app/_shared/components';
import Modal from '@/app/_shared/components/Modal';
import PortfolioGallery from '@/app/_shared/components/portfolio/portfolio-gallery';
import httpClient from '@/config/httpClient';
import { FolderRouterDto, TokenFolderPage } from '@/entities/folder';
import { ImageDto } from '@/entities/image';
import { ShimmerComponent, ShimmerImage } from '@/utils/ShimmerImage';
import { DownloadSimple } from '@phosphor-icons/react/dist/ssr';
import { useVirtualizer } from '@tanstack/react-virtual';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';

export function GalleryMansory({ folders }: FolderRouterDto) {
  const [images, setImages] = useState<ImageDto[] | undefined>(undefined)
  const [nextPage, setNextPage] = useState<TokenFolderPage>(undefined)
  const [isFetching, setIsFetching] = useState(false)

  const fetchImages = useCallback(async (nextPageProps?: TokenFolderPage) => {
    if (!folders) return;
    setIsFetching(true)

    try {
      const { photos, nextPageToken } = await httpClient.get<{
        photos: ImageDto[], nextPageToken: TokenFolderPage
      }>({
        url: '/get-photos-from-target-folder',
        params: {
          targetFolder: folders[folders.length - 1],
          limit: 18,
          nextPageToken: nextPageProps
        },
      });

      if (!photos || !nextPageToken) {
        throw {
          message: 'No photos or next page token',
          status: 404
        }
      }

      setNextPage(nextPageToken)
      setImages((prev) => [...(prev?.filter(img => !photos.some((p: ImageDto) => p.id === img.id)) || []), ...photos])
    } catch (err) {
      console.error('[get-photos-from-target-folder - API] Error getting photos:', err);
    }

    setIsFetching(false);
  }, [folders])

  useEffect(() => { fetchImages() }, [fetchImages])

  const rowVirtualizer = useVirtualizer({
    count: (images || []).length,
    getScrollElement: () => document.documentElement,
    estimateSize: () => 50, // Um valor aproximado inicial
    measureElement: (el) => el.getBoundingClientRect().height, // ✅ Mede altura real
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY; // Quanto o usuário já rolou
      const windowHeight = window.innerHeight; // Altura da viewport
      const documentHeight = document.documentElement.scrollHeight; // Altura total da página

      const distanceToBottom = documentHeight - (scrollY + windowHeight);

      if (distanceToBottom < 500 && !isFetching && nextPage) {
        fetchImages(nextPage);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchImages, isFetching, nextPage]);

  const breakpointColumns = {
    default: 4,
    1024: 3,
    768: 2,
    640: 1
  };

  const titleOfModal = folders[0].replaceAll('-', ' ').replace(/\b\w/g, (char) => char.toUpperCase()) + ' - ' + folders[folders.length - 1].replaceAll('-', ' ').replace(/\b\w/g, (char) => char.toUpperCase()) ;

  const handleNextPageOfImages = useCallback(async () => {
    if(!isFetching && nextPage) {
     await fetchImages(nextPage)
    }
  }, [fetchImages, nextPage, isFetching])

  const handleDownloadPhoto = useCallback(async (photo?: ImageDto | undefined) => {
    try {
      const response = await httpClient.get<Blob>({
        url: "/download-photo",
        params: {
          foldersName: JSON.stringify(folders),
          photoId: photo?.id,
        },
        moreOptions: (req) => {
          req.responseType('blob');
          return req;
        }
      })
  
      if (!response) {
        throw new Error("Falha ao baixar o arquivo");
      }
  
      // Cria um link temporário para o download
      const fileUrl= URL.createObjectURL(photo ? response : new Blob([response]))
      const a = document.createElement("a");
      a.href = fileUrl;
      a.download = photo?.id ? photo.name : `${folders.join(' - ')}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  
      // Libera memória
      URL.revokeObjectURL(fileUrl);
    } catch (error) {
      console.error('[download-photo - API] Error getting photos:', error);
    }
  }, [folders])

  if (!images) return null;

  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="flex gap-4"
      columnClassName="flex flex-col gap-4"
      style={{
        height: rowVirtualizer.getTotalSize(), // Altura total da lista
      }}
    >
      {rowVirtualizer.getVirtualItems().map((virtualRow) =>
        <div key={virtualRow.key} className='relative break-inside-avoid' >
          <Modal
            key={String(images[virtualRow.index]?.id)}
            title={
              <div className='max-w-[50%] absolute top-2 left-1/2 -translate-x-1/2 flex justify-center items-center gap-2'>
                <h3>{titleOfModal}</h3>
                <Button
                  className='flex items-center justify-center'
                  size='sm'
                  leftIcon={<DownloadSimple className='text-2xl' />}
                  onClick={() => handleDownloadPhoto(images[virtualRow.index])}
                >
                  Baixar foto
                </Button>
                <Button
                  className='flex items-center justify-center'
                  size='sm'
                  leftIcon={<DownloadSimple className='text-2xl' />}
                  onClick={() => handleDownloadPhoto()}
                >
                  Baixar todas as foto
                </Button>
              </div>
            }
            whitCloseButton
            trigger={
              <Image
                src={(images[virtualRow.index]?.webContentLink as string).replaceAll("=download", '=view')}
                alt={images[virtualRow.index]?.name}
                className='"w-full rounded-lg !relative !h-[auto]'
                objectFit="cover"

                width={1920}
                height={1080}
                quality={50}
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  maxHeight: "90%",
                }}
                placeholder={`data:image/svg+xml;base64,${ShimmerImage(1920, 1080)}`}
              />
            }
            content={<PortfolioGallery fetchNextImages={handleNextPageOfImages} listOfImages={images} currentImage={images[virtualRow.index]} />}
          />
          
        </div>
      )}
      {isFetching && Array.from({ length: 18 }).map((_, index) => (
        <div key={index} className='relative break-inside-avoid' >
          <ShimmerComponent w={1920} h={1080} />
        </div>
      ))}
    </Masonry>
  )
}
