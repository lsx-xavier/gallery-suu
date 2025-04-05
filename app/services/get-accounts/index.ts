import prisma from '@/(infra)/config/primsa';

export default async function getAllAccounts() {
  try {
    const allAccounts = await prisma.users.findMany();

    return allAccounts;
  } catch {
    throw {
      message: 'Error getting all accounts',
      status: 500,
    };
  }
}
