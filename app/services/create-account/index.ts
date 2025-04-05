import prisma from '@/src/config/primsa';
import { Users } from '@prisma/client';

export type RequestCreateAccountDto = Pick<Users, 'userName' | 'password' | 'role'>;

export default async function createAccount(data: Partial<RequestCreateAccountDto>) {
  try {
    if (!data.userName || !data.password) {
      throw {
        message: 'Username and password are required',
        status: 400,
      };
    }

    const maybeHasAccount = await prisma.users.findFirst({
      where: {
        userName: data.userName,
      },
    });

    if (maybeHasAccount) {
      throw {
        message: 'Account already exists',
        status: 400,
      };
    }

    const newAccount = await prisma.users.create({
      data: {
        userName: data.userName,
        password: data.password,
        role: 'USER',
      },
    });

    return newAccount;
  } catch {
    throw {
      message: 'Error creating account',
      status: 500,
    };
  }
}
