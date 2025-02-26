/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET_KEY as string;

// Gera um token JWT
export function generateToken(data: JSON | Record<string, any>) {
  return jwt.sign(data, SECRET_KEY, { expiresIn: '48d' });
}