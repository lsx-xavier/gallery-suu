import { FolderRouteParams } from '@/entities/folder';
import React from 'react';
import CheckAuthentication from './components/CheckAuthentication/CheckAuthentication';
import { FormCreateUser } from './components/CreateUserForm';

export default function Page({params}: FolderRouteParams) {
  const { folders } = React.use(params)

   if(folders.includes("create")) {
        return (
        <div className="h-screen w-screen fixed top-0 left-0">
          <div className="absolute top-0 left-0  bg-gray-500/55 w-screen h-screen backdrop-blur-[1.5px]"/>
  
          <FormCreateUser params={params} />
        </div>
      );
    }

  return (
    <div>
      <CheckAuthentication folders={folders} />
    </div>
  )
}
