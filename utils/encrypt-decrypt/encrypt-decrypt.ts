import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10; // Define a força da criptografia

// Função para criptografar a senha
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

// Função para comparar a senha digitada com a salva no banco
export async function comparePassword(plainText: string, hashed: string): Promise<boolean> {
  return await bcrypt.compare(plainText, hashed);
}