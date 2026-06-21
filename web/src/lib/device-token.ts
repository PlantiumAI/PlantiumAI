import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Token de firmware (sensor ↔ plataforma).
 *
 * Formato exibido ao usuário (uma única vez): `plt_<prefix8>_<secret32>`.
 * No banco guardamos apenas `prefix` (público) e `tokenHash` (HMAC-SHA256 do
 * token completo, com pepper de ambiente). Assim, vazamento do banco não revela
 * tokens válidos, e a verificação é resistente a timing attacks.
 */

const PEPPER = process.env.DEVICE_TOKEN_PEPPER ?? "";

function hmac(value: string): string {
  if (!PEPPER) {
    throw new Error("DEVICE_TOKEN_PEPPER não definida.");
  }
  return createHmac("sha256", PEPPER).update(value).digest("hex");
}

export interface GeneratedToken {
  /** valor completo — mostrar ao usuário UMA vez, nunca persistir em texto */
  token: string;
  prefix: string;
  tokenHash: string;
}

export function generateDeviceToken(): GeneratedToken {
  const prefix = randomBytes(6).toString("base64url").slice(0, 8);
  const secret = randomBytes(24).toString("base64url");
  const token = `plt_${prefix}_${secret}`;
  return { token, prefix, tokenHash: hmac(token) };
}

/** Extrai o prefixo de um token recebido do firmware (`plt_<prefix>_<secret>`). */
export function parsePrefix(token: string): string | null {
  const m = /^plt_([A-Za-z0-9_-]{8})_/.exec(token);
  return m ? m[1] : null;
}

/** Compara o token recebido contra o hash armazenado (timing-safe). */
export function verifyDeviceToken(token: string, storedHash: string): boolean {
  const candidate = Buffer.from(hmac(token), "hex");
  const expected = Buffer.from(storedHash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}
