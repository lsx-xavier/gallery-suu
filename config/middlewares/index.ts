//Agora, podemos verificar o token no middleware para proteger rotas privadas:
export function middleware(req: Request) {
  const token = req.cookies.get('auth_token')?.value;

  if (!token || !verifyToken(token)) {
    return NextResponse.redirect(new URL('/login', req.url)); // Redireciona para login
  }

  return NextResponse.next();
}

import jwt from 'jsonwebtoken';

// Middleware para verificar JWT nas requisições
export function verifyToken(token: string) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'super-secreto');
  } catch (error) {
    return null;
  }
}