'use client';
import { useVirtualizer } from '@tanstack/react-virtual';
import Image from 'next/image';
import { UIEvent, useCallback, useEffect, useRef, useState } from 'react';

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [images, setImages] = useState<any[]>([]);
  const [nextPageToken, setNextPageToken] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchImages = useCallback(async () => {
    if (loading || !hasMore) return; // Evita múltiplos requests simultâneos
    setLoading(true);
    const { imageFiles, nextPageToken: newNextPageToken } = await fetch(
      `/api/get-images?pageToken=${nextPageToken}&limit=10&folderName=Suellen, Leonel e Luisa`,
      {
        cache: 'force-cache',
      },
    ).then((resp) => resp.json());

    setImages((prev) => [...prev, ...(imageFiles as [])]);

    setNextPageToken(newNextPageToken);

    // Verifica se há mais imagens para carregar
    if (!newNextPageToken) {
      setHasMore(false); // Caso não haja próximo token, parar o carregamento
    }

    setLoading(false);
  }, [hasMore, loading, nextPageToken]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: images.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Estima o tamanho de cada item,
  });

  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    // @ts-expect-error - e.target.scrollHeight is not defined
    const bottom = e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;
    if (bottom && hasMore) {
      fetchImages(); // Carregar mais imagens ao alcançar o final
    }
  };

  return (
    <div
      ref={parentRef}
      onScroll={onScroll}
      style={{
        overflow: 'auto',
        position: 'relative',
      }}
    >
      <div
        style={{
          height: rowVirtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.index}
            style={{
              position: 'absolute',
              top: virtualItem.start,
              width: '100%',
              height: '100px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              border: '1px solid #ddd',
              marginBottom: '8px',
            }}
          >
            <Image
              key={images[virtualItem.index]?.id}
              src={
                (images[virtualItem.index]?.webContentLink as string).split('&export=download')[0]
              }
              alt={images[virtualItem.index]?.name}
              fill
              style={{ objectFit: 'contain' }}
            />
            {/* <Image key={images[virtualItem.index]?.id} src={`data:image/jpeg;base64,${images[virtualItem.index]?.image}`} alt="" fill style={{objectFit: "contain"}}/> */}
          </div>
        ))}
      </div>
      {loading && <div>Carregando...</div>}
      {!hasMore && <div>Não há mais imagens.</div>}
    </div>
  );
}
