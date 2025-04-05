'use server';
import { headers } from 'next/headers';

/**
 * This function is only on SSR.
 * @returns cookie of auth
 */

export async function getTokenCookie() {
  const headersList = await headers();
  const cookieHeader = headersList.get('cookie');

  if (!cookieHeader?.includes('suuAuth')) return undefined;

  // Divide todos os cookies e procura pelo suuAuth
  const cookies = cookieHeader.split(';').reduce<Record<string, string>>((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});

  return cookies['suuAuth'];
}
