'use client'
import httpClient from '@/config/httpClient';
import { FolderRouterDto, TokenFolderPage } from '@/entities/folder';
import { ImageDto } from '@/entities/image';
import { ShimmerImage } from '@/utils/ShimmerImage';
import { useVirtualizer } from '@tanstack/react-virtual';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
import { getApiFecthForImages } from './utils/ApiFetch';

export function GalleryMansory({ folders }: FolderRouterDto) {
    const [images, setImages] = useState<ImageDto[] | undefined>(undefined)
    const [nextPage, setNextPage] = useState<TokenFolderPage>(undefined)
    const [isFetching, setIsFetching] = useState(false)
  
    const fetchImages = useCallback(async (nextPageProps?: TokenFolderPage) => {
      if(!folders) return;
      setIsFetching(true)

      const response = await httpClient.get<{
        imageFiles: ImageDto[], nextPageToken: TokenFolderPage 
      }>({
        url: getApiFecthForImages({ folders }, nextPageProps),
        params: undefined,
        moreOptions: (req) => req.on('response', (res) => {
          console.log(`Baixando arquivo... Tamanho total: ${res.headers['content-length']} bytes`, {res});
        })
        .on('data', (chunk) => {
          console.log(`Recebidos ${chunk.length} bytes`);
        })
        .on('end', () => {
          console.log('Download concluído!');
        })
        .on('error', (err) => {
          console.error('Erro no download:', err);
        })
      });
      if(response) {
        console.log({response})
        const {imageFiles, nextPageToken} = response

        setNextPage(nextPageToken)
        setImages((prev => [...(prev||[]), ...imageFiles]))
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
  
    if(!images) return null;
    
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
            <Image
              src={(images[virtualRow.index]?.webContentLink as string).split("&export=download")[0]}
              alt={images[virtualRow.index]?.name}
              className='"w-full rounded-lg !relative !h-[auto]'
              objectFit="cover"
              
              width={1920}
              height={1080}
              quality={50}
              style={{
                maxWidth: "100%",
                height: "auto",
              }}
              placeholder={`data:image/svg+xml;base64,${ShimmerImage(1920, 1080)}`}
            />
          </div>
        )}
      </Masonry>
    )
}
