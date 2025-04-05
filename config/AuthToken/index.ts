import { generateToken } from './GenerateToken';
import { verifyToken } from './VerifyToken';

export const authToken = {
  generateToken: generateToken,
  verifyToken: verifyToken,
};
