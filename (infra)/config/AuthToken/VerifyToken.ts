'use server';

import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET_KEY as string;

// Valida o token JWT
export async function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err: unknown) {
    throw err;
  }
}
