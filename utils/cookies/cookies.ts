export function getCookie(name: string) {
  const cookies = document.cookie.split("; ");
  
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=");
    
    if (cookieName === name) return cookieValue;
  }
  return null;
}

type setCookieOptionsProps = {
  path?: string;
  maxAge?: number;
}
/**
 * 
 * @param key 
 * Set the key of cookie
 * @param data 
 * Set the value for the key
 * @param options
 *  path = Set where the cookie is visible (default: /) |
 *  maxAge = Set the time of the cookie (default: 60 * 60 * 24 * 7 = 7 days)
 */
export function setCookie(key: string, data: JSON, options?: setCookieOptionsProps) {
  const baseData = `${key}=${data}; path=${String(options?.path) || "/"};  max-age="${String(options?.maxAge || 60 * 60 * 24 * 7)}`
 
  document.cookie = baseData;
}