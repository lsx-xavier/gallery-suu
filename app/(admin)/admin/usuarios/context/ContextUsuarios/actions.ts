'use server'

import prisma from "@/config/primsa";
import { getAllFolders } from "../../../pastas/action";
import { Users } from "@prisma/client";

export async function getAllUsers() {
    const allAccounts = await prisma.users.findMany();

    return allAccounts;
}

export type UserWithFolders = Users & { folders: string[] };

export async function getUsersWithFolders(): Promise<UserWithFolders[]> {
    const allFolders = await getAllFolders();
    
    const allUsers = await getAllUsers();

    const usersWithFolders = allUsers.map(user => ({
            ...user,
            folders: Object.values(allFolders).flat().filter(folder => folder.usersIds?.includes(user.id)).map(f => f.id),
        }));

    return usersWithFolders;
}