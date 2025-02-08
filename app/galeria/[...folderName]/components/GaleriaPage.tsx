import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';

type GaleriaPageProps = {
  params: Promise<{
    folderName: string[]
  }>
}

export default function GaleriaPage({params}: GaleriaPageProps) {
const {folderName} = React.use(params);
  const [images, setImages] = useState()

  const fetchImages = useCallback(async () => {
    if(!folderName) return;

    const {imageFiles} = await fetch(`/api/get-images?limit=10&parentFolder=${folderName[0]}&currentFolder=${folderName[folderName.length - 1]}`, {
      cache: "force-cache"
    }).then(resp => resp.json());

    console.log(imageFiles)
    
    setImages(imageFiles)
  }, [folderName])

  useEffect(() => {fetchImages()},[fetchImages])

  const imageRef = useRef<HTMLImageElement>(null)

  
  return (
    <div className='grid grid-cols-4 gap-4'>
      {images?.map(image =>
      <div key={image.id} >
        {console.log(imageRef.current?.getBoundingClientRect().height)}
          <Image
          ref={imageRef}
            src={(image.webContentLink as string).split("&export=download")[0]}
            alt={image.name}
            className='"w-full rounded-lg'
            width="1920"
            height="1080"
            // height={imageRef.current?.getBoundingClientRect().height}
            
            // style={{objectFit: "contain"}}
            // objectFit="cover"
            // objectPosition="50%,50%"
          />
          </div>
      )}
    </div>
  )
}
