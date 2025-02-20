import { headers } from "next/headers";

/**
 * This function is only on SSR.
 * @returns cookie of auth
 */

export async function getTokenCookie() {
  const headersList = await headers();
  const token = headersList.get("cookie");
  const tokenSplit = token?.slice(token.indexOf("=") + 1, token.indexOf(';'))

  return tokenSplit
}