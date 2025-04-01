'use server'

import prisma from "@/config/primsa";
import { Folder } from "@prisma/client";



export async function getAllFolders(): Promise<Folder[]> {
    return await prisma.folder.findMany();
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
    const userInfolders = await prisma.folder.findMany({
        where: { usersIds: { has: userId } },
    });

    return userInfolders;
}

export async function updateUserIdInFolders(userId: string, folders: string[]) {
    // Busca todas as pastas que o usuário tem acesso atualmente
    const userInfolders = await getAllFoldersByUserId(userId);

    // Para cada pasta atual do usuário
    for(const f of userInfolders) {
        // Se a pasta não está na nova lista de pastas, remove o acesso do usuário
        if(!folders.includes(f.id)) {
            await prisma.folder.update({
                where: { id: f.id },
                data: { 
                    usersIds: {
                        set: f.usersIds.filter(folderUserId => folderUserId !== userId)
                    }
                }
            });
        }
        
        // Remove o ID da pasta da lista de folders
        const index = folders.indexOf(f.id);
        if (index > -1) {
            folders.splice(index, 1);
        }
    }

    // Adiciona o usuário às pastas restantes (que são apenas as novas)
    for(const newFolderId of folders) {
        await prisma.folder.update({
            where: { id: newFolderId },
            data: { 
                usersIds: {
                    push: userId
                }
            }
        });
    }
}
