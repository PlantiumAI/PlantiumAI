import bcrypt from "bcryptjs";

// Hashing de senha com bcrypt (custo 12). bcryptjs é JS puro — roda no runtime Node da Vercel.
const ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
