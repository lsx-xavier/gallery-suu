'use client'

import { getImagesByFolder } from "@/app/actions/get-images-by-folder/action";
import { ShimmerImage } from "@/utils/ShimmerImage";
import Image from "next/image";
import { useEffect, useState } from "react";
import Masonry from 'react-masonry-css';

// TODO: Change to input text to type the name of the picture/image, and then filter the photos by name and show the result in preview

export function ThumbGallery({ folderId }: { folderId: string }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [photos, setPhotos] = useState<any[] | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [nextPageToken, setNextPageToken] = useState<string | null | undefined>(undefined);

    useEffect(() => {
        getImagesByFolder(folderId, 10).then(({photos, nextPageToken}) => {
            setPhotos(photos);
            setNextPageToken(nextPageToken);
            setIsLoading(false);
        });
    }, [folderId]);

    console.log(photos)
    
    const breakpointColumns = {
        default: 4,
        1024: 3,
        768: 2,
        640: 1,
      };


    return (
        <Masonry
        breakpointCols={breakpointColumns}
        className="flex gap-1 max-h-[300px] overflow-y-auto"
        columnClassName="flex flex-col gap-1"
        >
            {photos?.map((photo) => {
                if(!photo || !photo.webContentLink) return null;

                return (
                <div key={photo.id} className="relative break-inside-avoid">
                    <Image
                        src={photo.webContentLink.replaceAll(
                            '=download',
                            '=view',
                        )}
                        alt={photo.name || 'Suuk foto'}
                        className="w-full rounded-lg !relative !h-[auto]"
                        objectFit="cover"
                        width={1920}
                        height={1080}
                        quality={50}
                        style={{
                            maxWidth: '100%',
                            height: 'auto',
                            maxHeight: '90%',
                        }}
                        placeholder={`data:image/svg+xml;base64,${ShimmerImage(1920, 1080)}`}
                    />
                </div>
            )})}
        </Masonry>
    );
}