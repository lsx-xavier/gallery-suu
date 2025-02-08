import Image from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';

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

    const {imageFiles, nextPageToken: newNextPageToken} = await fetch(`/api/get-images?limit=10&parentFolder=${folderName[0]}&currentFolder=${folderName[folderName.length - 1]}`, {
      cache: "force-cache"
    }).then(resp => resp.json());

    console.log(imageFiles)
    
    setImages(imageFiles)
  }, [folderName])

  useEffect(() => {fetchImages()},[fetchImages])

  
  return (
    <div className='grid grid-cols-6'>
      {images?.map(image =>
        <div>
          <Image key={image.id} src={(image.webContentLink as string).split("&export=download")[0]} alt={image.name} fill style={{objectFit: "contain"}} />
      </div>
      )}
    </div>
  )
}
