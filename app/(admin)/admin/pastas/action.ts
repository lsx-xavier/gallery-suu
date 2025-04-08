'use server';

import { streamToBuffer } from '@/(infra)/utils/stream-to-buffer';
import { getImageById } from '@/app/_shared/actions/get-images-by-folder/action';
import prisma from '@/infra/config/primsa';
import { Folder, Prisma, ThumbFolder, Users } from '@prisma/client';

export type FoldersWithUsers = Prisma.FolderGetPayload<{
  include: { users: true; thumbFolder: true };
}>;

export async function getAllFolders(): Promise<FoldersWithUsers[]> {
  return await prisma.folder.findMany({
    include: {
      users: true,
      thumbFolder: true,
    },
  });
}

export async function getFolderById(id: string): Promise<FoldersWithUsers | null> {
  return await prisma.folder.findUnique({
    where: { id },
    include: {
      users: true,
      thumbFolder: true,
    },
  });
}

export type FolderWithHierarchy = Record<string, FoldersWithUsers[]>;

export async function getAllFoldersWithHierarchy(): Promise<FolderWithHierarchy> {
  try {
    console.debug('[getAllFolders] Buscando todas as pastas');
    const allFolders = await getAllFolders();

    console.log(
      'allFolders',
      allFolders.filter((f) => f.slugParent === 'keiti-e-diogo'),
    );

    return (
      allFolders.reduce(
        (acc: Record<string, FoldersWithUsers[]>, folder: FoldersWithUsers) => {
          const parentId = folder.parentId !== '' ? folder.parentId : folder.folderId;

          if (!acc[parentId as keyof typeof acc]) {
            acc[parentId as keyof typeof acc] = [];
          }

          acc[parentId as keyof typeof acc].push(folder);

          return acc;
        },
        {} as Record<string, FoldersWithUsers[]>,
      ) || {}
    );
  } catch (error) {
    console.debug('[getAllFolders] Erro ao buscar pastas');
    console.error(error);
    return {};
  }
}

export async function getAllFoldersByUserId(userId: string) {
  // Usando a relação direta do Prisma
  const userWithFolders = await prisma.users.findUnique({
    where: { id: userId },
    include: {
      folders: true,
    },
  });

  return userWithFolders?.folders || [];
}

export async function updateUserIdInFolders(userId: string, folders: string[]) {
  // Buscar o usuário
  const user = await prisma.users.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  // Atualizar as relações do usuário com as pastas em uma única operação
  await prisma.users.update({
    where: { id: userId },
    data: {
      folders: {
        set: folders.map((id) => ({ id })),
      },
    },
  });
}

export type updateFolderInfosProps = {
  folderId: Folder['id'];
  usersIds: Users['id'][];
  photo: Pick<ThumbFolder, 'photoId' | 'photoName' | 'photoUrl'>;
};

export async function updateFolderInfos({ folderId, usersIds, photo }: updateFolderInfosProps) {
  if (!photo) {
    throw {
      status: 404,
      message: 'Nenhuma imagem encontrada',
    };
  }

  const maybeImage = await getImageById(photo.photoId);

  if (!maybeImage) {
    throw {
      status: 404,
      message: 'Nenhuma imagem encontrada',
    };
  }

  // Converte o Readable Stream em um Buffer
  const imageData = await streamToBuffer(maybeImage.data);

  // Convert buffer to base64 string
  const base64Image = imageData.toString('base64');
  const imageSrc = `data:image/jpeg;base64,${base64Image}`; // Adjust the MIME type as necessary

  await prisma.folder.update({
    where: { id: folderId },
    data: {
      users: {
        set: usersIds?.map((id) => ({ id })),
      },
      thumbFolder: {
        upsert: {
          create: {
            photoId: photo.photoId,
            photoName: photo.photoName,
            photoUrl: imageSrc,
          },
          update: {
            photoId: photo.photoId,
            photoName: photo.photoName,
            photoUrl: imageSrc,
          },
        },
      },
    },
  });
}
