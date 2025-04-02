'use client';

import { Folder, Users } from '@prisma/client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAllUsers, UserWithFolders } from '../../../usuarios/action';
import { getFolderById } from '../../action';
import { UserSelection } from './UserSelection';
import { ThumbGallery } from './ThumbGallery';

export function ModalConfigurar() {
  const { id: folderId } = useParams();
  const [users, setUsers] = useState<UserWithFolders[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Users['id'][]>([]);
  const [folder, setFolder] = useState<Folder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getFolderById(folderId as string), getAllUsers()]).then(([folder, users]) => {
      setFolder(folder);
      setUsers(users);
      setIsLoading(false);
    });
  }, [folderId]);

  const handleSelect = (userId: string) => {
    setSelectedUsers([...selectedUsers, userId]);
  };

  return (
    <div className="flex flex-col gap-4 min-w-[500px] max-w-[80%]">
      {isLoading ? (
        <div>Carregando...</div>
      ) : (
        <>
          <h1 className="text-lg font-bold flex flex-col">Configurações <span className="text-sm font-normal">{folder?.folderName}</span></h1>

          <div className="flex flex-col gap-2">
            <h6 className="text-sm font-bold">Usuários</h6>

            <div className="flex justify-between ">
                <div className="flex-1">
              <UserSelection
                folderId={folderId as string}
                isLoading={isLoading}
                users={users}
                onSelect={handleSelect}
              />
              </div>

              <ThumbGallery folderId={folderId as string} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
