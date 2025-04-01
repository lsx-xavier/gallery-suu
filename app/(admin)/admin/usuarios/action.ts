'use server'

import  { RequestCreateAccountDto } from "@/app/services/create-account";
import prisma from "@/config/primsa";
import { hashPassword } from "@/utils/encrypt-decrypt";
import { updateUserIdInFolders } from "../pastas/action";

type RequestCreateUserDto = RequestCreateAccountDto & {
    id?: string;
    folders: string[];
}

export async function getAllUsers() {
    const users = await prisma.users.findMany()
    return users
}
 
export async function create(formData: RequestCreateUserDto) {
    const { userName, password } = formData;

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
            role: "USER"
        }
    })

    if(!newUser) {
        throw new Error('Erro ao criar usuário');
    }

    for(const f of formData.folders) {
        const folder = await prisma.folder.findUnique({
            where: { id: f },
            select: { usersIds: true }
        });

        if(!folder) {
            throw new Error('Pasta não encontrada');
        }

        if(folder.usersIds.includes(newUser.id)) {
            throw new Error('Usuário já possui acesso a esta pasta');
        }

        await prisma.folder.update({
            where: {
                id: f
            },
            data: {
                usersIds: {
                    push: newUser.id
                }
            }
        })
    }
    
}

export async function update(formData: RequestCreateUserDto) {
    const { id, userName, password } = formData;

    if(!id) {
        throw new Error('Requisição inválida');
    }

    const findUser = await prisma.users.findUnique({
        where: { id }
    })

    if(!findUser) {
        throw new Error('Usuário não encontrado');
    }

    if(!userName || !password) {
        throw new Error('Preencha todos os campos');
    }

    const parsedHashPassword = await hashPassword(password);

    if(parsedHashPassword !== findUser.password) {
        await prisma.users.update({
            where: { id },
            data: {
                password: parsedHashPassword
            }
        })
    }

    if(userName !== findUser.userName) {
        await prisma.users.update({
            where: { id },
            data: {
                userName
            }
        })
    }

    await updateUserIdInFolders(findUser.id, formData.folders);
}