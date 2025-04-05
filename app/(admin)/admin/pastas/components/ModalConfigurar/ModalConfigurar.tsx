'use client';

import { Folder, Users } from '@prisma/client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAllUsers, UserWithFolders } from '../../../usuarios/action';
import { FoldersWithUsers, getFolderById, updateFolderInfos } from '../../action';
import { UserSelection } from './UserSelection';
import { ThumbGallery } from './ThumbGallery';
import { Button } from '@/app/_shared/components/Button';

export type SelectedInfos = {
  users: Users['id'][] | undefined;
  photo: string | undefined;
};

export function ModalConfigurar() {
  const router = useRouter();

  const { id: folderId } = useParams();
  const [users, setUsers] = useState<UserWithFolders[]>([]);
  const [folder, setFolder] = useState<FoldersWithUsers | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedUsers, setSelectedUsers] = useState<{ [id: string]: boolean }[] | undefined>(
    undefined,
  );
  console.log({ selectedUsers });

  const [selectedPhoto, setSelectedPhoto] = useState<string | undefined>(undefined);

  useEffect(() => {
    Promise.all([getFolderById(folderId as string), getAllUsers()]).then(([folder, users]) => {
      setFolder(folder);
      setUsers(users);

      setSelectedUsers(folder?.users.map((user) => ({ [user.id]: true })));
      setIsLoading(false);
    });
  }, [folderId]);

  const handleSave = async () => {
    await updateFolderInfos(folderId as string, {
      users: [],
      photo: selectedPhoto,
    });

    router.back();
  };

  return (
    <div className="flex max-w-[80%] min-w-[400px] flex-col gap-4">
      {isLoading ? (
        <div>Carregando...</div>
      ) : (
        <>
          <h1 className="flex flex-col text-lg font-bold">
            Configurações <span className="text-sm font-normal">{folder?.folderName}</span>
          </h1>

          <div className="flex justify-between gap-4">
            <UserSelection
              folderId={folderId as string}
              isLoading={isLoading}
              users={users}
              defaultUsersFolders={selectedUsers}
              onSelect={setSelectedUsers}
            />

            <div className="flex-1">
              <ThumbGallery folderId={folderId as string} onSelect={setSelectedPhoto} />
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end gap-2">
        <Button
          onClick={() => router.back()}
          variant="outline"
          size="sm"
          className="border-gray-500 text-gray-500 opacity-60 hover:opacity-100"
        >
          Voltar
        </Button>

        <Button
          onClick={handleSave}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="border-orange-400 text-orange-400 opacity-60 hover:opacity-100"
        >
          Salvar
        </Button>
      </div>
    </div>
  );
}
