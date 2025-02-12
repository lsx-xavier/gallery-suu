'use client'
import { ShimmerImage } from '@/utils/ShimmerImage';
import { useVirtualizer } from '@tanstack/react-virtual';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';

type GalleryMansoryProps = {
  folders: string[];
}

export function GalleryMansory({ folders }: GalleryMansoryProps) {
    const [images, setImages] = useState(undefined)
    const [nextPage, setNextPage] = useState(undefined)
    const [isFetching, setIsFetching] = useState(false)
  
    const fetchImages = useCallback(async (nextPageProps?: string) => {
      if(!folders) return;
      setIsFetching(true)
  
      let url = `/api/get-images-from?limit=18`
      if(nextPageProps) {
        url = url.concat(`&nextPageToken=${nextPageProps}`)
        console.log({url})
      }
      if(folders.length > 1) {
        url = url.concat(`&parentFolder=${folders[0]}&targetFolder=${folders[folders.length - 1]}`)
      } else {
        url = url.concat(`&targetFolder=${folders[0]}`)
      }
  
      const {imageFiles, nextPageToken} = await fetch(url, {
        cache: "force-cache"
      }).then(resp => resp.json());
  
      setIsFetching(false);
      setNextPage(nextPageToken)
      setImages((prev => [...(prev||[]), ...imageFiles]))
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
        
        if (distanceToBottom < 400 && !isFetching && nextPage) {
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
