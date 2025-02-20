import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value; // Lê o cookie HttpOnly

  const requestHeaders = new Headers(req.headers);
  if (token) {
    requestHeaders.set("x-user-token", token); // Adiciona o token nos headers
  }

  // Encaminha a requisição com os headers modificados
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  return response;
}

// Define quais rotas o Middleware deve afetar (opcional)
export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)", // Exclui assets e API routes
};