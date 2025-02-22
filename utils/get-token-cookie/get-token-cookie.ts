import { headers } from "next/headers";

/**
 * This function is only on SSR.
 * @returns cookie of auth
 */

export async function getTokenCookie() {
  const headersList = await headers();
  const token = headersList.get("cookie");
  if(!token?.includes('userToken')) return undefined;
  
  const tokenSplit = token?.slice(token.indexOf("userToken") + 2, token.indexOf(';'))

  return tokenSplit
}