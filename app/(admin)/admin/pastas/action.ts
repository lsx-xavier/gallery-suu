'use server'

import prisma from "@/config/primsa";
import { Folder, Prisma } from "@prisma/client";
import { SelectedInfos } from "./components/ModalConfigurar/ModalConfigurar";

export type FoldersWithUsers = Prisma.FolderGetPayload<{
    include: { users: true }
}>


export async function getAllFolders(): Promise<Folder[]> {
    return await prisma.folder.findMany({
        include: {
            users: true
        }
    });
}

export async function getFolderById(id: string): Promise<FoldersWithUsers | null> {
    return await prisma.folder.findUnique({
        where: { id },
        include: {
            users: true
        }
    });
}

export type FolderWithHierarchy = Record<string, Folder[]>

export async function getAllFoldersWithHierarchy(): Promise<FolderWithHierarchy> {
    try {
        console.debug('[getAllFolders] Buscando todas as pastas');
        const allFolders = await getAllFolders();
        
        return allFolders.reduce((acc: Record<string, Folder[]>, folder: Folder) => {
            const parentId = folder.parentId !== "" ? folder.parentId : folder.folderId;

            if(!acc[parentId as keyof typeof acc]) {
                acc[parentId as keyof typeof acc] = []
            }

            acc[parentId as keyof typeof acc].push(folder);

            return acc;
        }, {} as Record<string, Folder[]>) || {};
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
            folders: true
        }
    });

    return userWithFolders?.folders || [];
}

export async function updateUserIdInFolders(userId: string, folders: string[]) {
    // Buscar o usuário
    const user = await prisma.users.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new Error('Usuário não encontrado');
    }

    // Atualizar as relações do usuário com as pastas em uma única operação
    await prisma.users.update({
        where: { id: userId },
        data: {
            folders: {
                set: folders.map(id => ({ id }))
            }
        }
    });
}

export async function updateFolderInfos(folderId: string, infos: SelectedInfos) {
    await prisma.folder.update({
        where: { id: folderId },
        data: {
            users: {
                set: infos.users?.map(id => ({ id }))
            },
            thumbId: infos.photo
        }
    });
}
