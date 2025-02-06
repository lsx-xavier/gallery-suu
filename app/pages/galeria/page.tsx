import Image from "next/image";
import { useCallback, useState } from "react";

export function Home({ initialImages, initialNextPageToken }: any) {
  const [images,setImages] = useState(initialImages)
  const [nextPageToken,setNextPageToken] = useState(initialNextPageToken)

  const fetchImages = useCallback(async () => {
    const {imageFiles, nextPageToken} = await fetch("/api/get-images").then(resp => resp.json());
    
    setImages(imageFiles);
    setNextPageToken(nextPageToken)
  },[]);



  return (
    <div>
      
      {images?.map((image) => 
        <div key={image.id}>
          <Image key={image.id} src={(image.webViewLink as string)} alt={image.name} width={400} height={400} />
          {/* <Image key={image.id} src={(image.webViewLink as string).split("&export=download")[0]} alt={image.name} width={400} height={400} /> */}
           {/* <Image key={image.id} src={`data:image/jpeg;base64,${image.image}`} alt="" width={400} height={400} /> */}
        </div>
      )}
      
    </div>
  );
}

export async function getServerSideProps() {
  const {imageFiles, nextPageToken} =await fetch(`/api/get-images?pageToken=&limit=10`).then(resp => resp.json());

  return {
    props: {
      initialImages: imageFiles,
      initialNextPageToken: nextPageToken,
    },
    revalidate: 60, // Regenera a página a cada 60s no servidor
  };
}

export default Home