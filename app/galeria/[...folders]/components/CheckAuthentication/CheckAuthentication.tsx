
import { FolderRouterDto } from '@/entities/folder';
import { getTokenCookie } from '@/utils/get-token-cookie';
import { AuthForm } from '../AuthForm';
import { GalleryMansory } from '../GalleryMansory';

export default async function CheckAuthentication({ folders }: FolderRouterDto) {
  // verificar forma de reload para que ele puxe esse dado novamente
  const hasToken = await getTokenCookie()
  console.log(hasToken)

  if(!hasToken) {
    return (
      <div className="h-screen w-screen fixed top-0 left-0">
        <div className="absolute top-0 left-0 bg-gray-500/55 w-screen h-screen backdrop-blur-[1.5px]"/>

          <AuthForm folders={folders} />
      </div>
    )
  }
  
  return (
    <div><GalleryMansory folders={folders} /></div>
  )
}
