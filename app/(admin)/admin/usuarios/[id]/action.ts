'use server'

import  { RequestCreateAccountDto } from "@/app/services/create-account";
import prisma from "@/config/primsa";
import { hashPassword } from "@/utils/encrypt-decrypt";

type RequestCreateUserDto = RequestCreateAccountDto & {
    id?: string;
    folders: string[];
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

    // Busca todas as pastas que o usuário tem acesso atualmente
    const userInfolders = await prisma.folder.findMany({
        where: { usersIds: { has: findUser.id } },
    });

    // Para cada pasta atual do usuário
    for(const f of userInfolders) {
        // Se a pasta não está na nova lista de pastas, remove o acesso do usuário
        if(!formData.folders.includes(f.id)) {
            await prisma.folder.update({
                where: { id: f.id },
                data: { 
                    usersIds: {
                        set: f.usersIds.filter(userId => userId !== findUser.id)
                    }
                }
            });
        }
        
        // Remove o ID da pasta da lista de formData.folders
        const index = formData.folders.indexOf(f.id);
        if (index > -1) {
            formData.folders.splice(index, 1);
        }
    }

    // Adiciona o usuário às pastas restantes (que são apenas as novas)
    for(const newFolderId of formData.folders) {
        await prisma.folder.update({
            where: { id: newFolderId },
            data: { 
                usersIds: {
                    push: findUser.id
                }
            }
        });
    }
}