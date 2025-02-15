'use client'

import { FolderRouterDto } from '@/entities/folder';
import { useState } from 'react';
import { AuthForm } from '../AuthForm';
import { GalleryMansory } from '../GalleryMansory';

export default function CheckAuthentication({ folders }: FolderRouterDto) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if(!isAuthenticated) {
    return (
      <div className="h-screen w-screen fixed top-0 left-0">
        <div className="absolute top-0 left-0 bg-gray-500/55 w-screen h-screen backdrop-blur-[1.5px]"/>

          <AuthForm setAuthenticated={setIsAuthenticated} folders={folders} />
      </div>
    )
  }

  return (
    <div><GalleryMansory folders={folders} /></div>
  )
}
