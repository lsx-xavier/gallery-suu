'use server'

import { RequestCreateAccountDto } from "@/app/services/create-account";
import prisma from "@/config/primsa";
import { hashPassword } from "@/utils/encrypt-decrypt";
import { Prisma } from "@prisma/client";


export type UserWithFolders = Prisma.UsersGetPayload<{
    include: { folders: true }
}>

type RequestCreateUserDto = RequestCreateAccountDto & {
    id?: string;
    folders: string[];
}

export async function getAllUsers(): Promise<UserWithFolders[]> {
    const users = await prisma.users.findMany({
        include: {
            folders: true
        }
    });
    
    return users
}
 
export async function create(formData: RequestCreateUserDto) {
    const { userName, password, folders } = formData;

    if(!userName || !password) {
        throw new Error('Preencha todos os campos');
    }

    const alreadyExists = await prisma.users.findFirst({
        where: {
            userName: userName
        }
    })

    if(alreadyExists) {
        throw new Error('Usuário já existe, escolha outro nome de usuário');
    }
    

    const parsedHashPassword = await hashPassword(password);

    const newUser = await prisma.users.create({
        data: {
            userName,
            password: parsedHashPassword,
            role: "USER",
            folders: {
                connect: folders.map(id => ({ id }))
            }
        },
        include: {
            folders: true
        }
    })

    if(!newUser) {
        throw new Error('Erro ao criar usuário');
    }

    return newUser;
}

export async function update(formData: RequestCreateUserDto) {
    const { id, userName, password, folders } = formData;

    if(!id) {
        throw new Error('Requisição inválida');
    }

    const findUser = await prisma.users.findUnique({
        where: { id },
        include: {
            folders: true
        }
    })

    if(!findUser) {
        throw new Error('Usuário não encontrado');
    }

    if(!userName || !password) {
        throw new Error('Preencha todos os campos');
    }

    const parsedHashPassword = await hashPassword(password);
    
    const updatedUser = await prisma.users.update({
        where: { id },
        data: {
            userName: userName !== findUser.userName ? userName : undefined,
            password: parsedHashPassword !== findUser.password ? parsedHashPassword : undefined,
            folders: {
                set: folders.map(id => ({ id }))
            }
        },
        include: {
            folders: true
        }
    });

    return updatedUser;
}