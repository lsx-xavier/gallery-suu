'use server'

import prisma from "@/config/primsa";
import { Folder } from "@prisma/client";

 
export async function getAllFolders(): Promise<Record<string, Folder[]>> {
    try {
        console.debug('[getAllFolders] Buscando todas as pastas');
        const allFolders = await prisma.folder.findMany();
        
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
