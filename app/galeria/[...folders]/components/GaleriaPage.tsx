import { ShimmerImage } from '@/src/utils/shimmer-image';
import { useVirtualizer } from '@tanstack/react-virtual';
import Image from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';

type GaleriaPageProps = {
  params: Promise<{
    folderName: string[];
  }>;
};

export default function GaleriaPage({ params }: GaleriaPageProps) {
  const { folderName } = React.use(params);
  const [images, setImages] = useState<[]>([]);
  const [nextPage, setNextPage] = useState(undefined);
  const [isFetching, setIsFetching] = useState(false);

  const fetchImages = useCallback(
    async (nextPageProps?: string) => {
      if (!folderName) return;
      setIsFetching(true);

      let url = `/api/get-images-from?limit=30`;
      if (nextPageProps) {
        url = url.concat(`&nextPageToken=${nextPageProps}`);
      }
      if (folderName.length > 1) {
        url = url.concat(
          `&parentFolder=${folderName[0]}&targetFolder=${folderName[folderName.length - 1]}`,
        );
      } else {
        url = url.concat(`&targetFolder=${folderName[0]}`);
      }

      const { imageFiles, nextPageToken } = await fetch(url, {
        cache: 'force-cache',
      }).then((resp) => resp.json());

      setIsFetching(false);
      setNextPage(nextPageToken);
      setImages((prev) => [...(prev || []), ...((imageFiles as []) || [])]);
    },
    [folderName],
  );

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const rowVirtualizer = useVirtualizer({
    count: (images || []).length,
    getScrollElement: () => document.documentElement,
    estimateSize: () => 50, // Um valor aproximado inicial
    measureElement: (el) => el.getBoundingClientRect().height, // ✅ Mede altura real
  });

  useEffect(() => {
    const lastItem = rowVirtualizer.getVirtualItems().at(-1);
    if (!lastItem && !images) return;
    console.log(lastItem);
    console.log(images?.length - 1);

    const isAtBottom = (lastItem?.index || 0) >= images.length - 1;

    if (isAtBottom && !isFetching) {
      fetchImages(nextPage);
    }
  }, [fetchImages, images, isFetching, nextPage, rowVirtualizer]);

  const breakpointColumns = {
    default: 4,
    1024: 3,
    768: 2,
    640: 1,
  };

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
      {rowVirtualizer.getVirtualItems().map((virtualRow) => (
        <div key={virtualRow.key} className="relative break-inside-avoid">
          <Image
            src={
              (
                (images[virtualRow.index] as { webContentLink: string })?.webContentLink as string
              ).split('&export=download')[0]
            }
            alt={(images[virtualRow.index] as { name: string })?.name}
            className='"w-full !relative !h-[auto] rounded-lg'
            objectFit="cover"
            loading="lazy"
            width={1920}
            height={1080}
            quality={50}
            style={{
              maxWidth: '100%',
              height: 'auto',
            }}
            placeholder={`data:image/svg+xml;base64,${ShimmerImage(1920, 1080)}`}
          />
        </div>
      ))}
    </Masonry>
  );
}
