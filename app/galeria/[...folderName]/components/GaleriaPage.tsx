import Image from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';

type GaleriaPageProps = {
  params: Promise<{
    folderName: string[]
  }>
}

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#333" offset="20%" />
      <stop stop-color="#222" offset="50%" />
      <stop stop-color="#333" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#333" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

export default function GaleriaPage({params}: GaleriaPageProps) {
  const {folderName} = React.use(params);
  const [images, setImages] = useState()

  const fetchImages = useCallback(async () => {
    if(!folderName) return;

    const {imageFiles} = await fetch(`/api/get-images-from?limit=10&parentFolder=${folderName[0]}&targetFolder=${folderName[folderName.length - 1]}`, {
      cache: "force-cache"
    }).then(resp => resp.json());

    console.log(imageFiles)
    
    setImages(imageFiles)
  }, [folderName])

  useEffect(() => {fetchImages()},[fetchImages])


  
  return (
    // <div className='grid grid-cols-4 gap-4'>
    <div className='columns-4 gap-4'>
      {images?.map(image =>
      <div key={image.id} className='relative mb-4'>
          <Image
            src={(image.webContentLink as string).split("&export=download")[0]}
            alt={image.name}
            className='"w-full rounded-lg !relative !h-[auto]'
            // fill={true}
            objectFit="cover"
            loading='lazy'
            width={1920}
            height={1080}
            quality={50}
            style={{
              maxWidth: "100%",
              height: "auto",
            }}
            placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(1920, 1080))}`}
          />
          </div>
      )}
    </div>
  )
}
