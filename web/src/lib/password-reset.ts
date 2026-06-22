// Fluxo SEGURO de redefinição de senha (token de uso único).
// - Token = 32 bytes CSPRNG (vai no link, alta entropia).
// - No banco guardamos APENAS sha256(token) — vazamento do DB não forja link.
// - Expiração curta (30 min). Reusa a tabela verification_tokens do Auth.js.
// - Uso único: ao consumir, removemos todos os tokens daquele email.
// Roda só no servidor (Node runtime) — usado apenas em server actions.
import { createHash, randomBytes } from "crypto";
import { and, eq, lt } from "drizzle-orm";
import { db } from "@/db";
import { verificationTokens } from "@/db/schema";

const TTL_MS = 30 * 60 * 1000;
const PREFIX = "pwreset:"; // namespaceia o identifier p/ não colidir com outros usos

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

/** Gera um token de reset para o email e retorna o token CRU (para o link). */
export async function createResetToken(email: string): Promise<string> {
  const identifier = PREFIX + email.toLowerCase();
  const raw = randomBytes(32).toString("hex");
  const tokenHash = sha256(raw);
  const expires = new Date(Date.now() + TTL_MS);

  // Invalida tokens anteriores deste email + faxina de expirados.
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, identifier));
  await db.delete(verificationTokens).where(lt(verificationTokens.expires, new Date()));
  await db.insert(verificationTokens).values({ identifier, token: tokenHash, expires });
  return raw;
}

/** Consome um token cru: valida hash + expiração, remove (uso único) e devolve o email. */
export async function consumeResetToken(raw: string): Promise<string | null> {
  if (!raw || raw.length < 32) return null;
  const tokenHash = sha256(raw);
  const [row] = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.token, tokenHash))
    .limit(1);

  if (!row || !row.identifier.startsWith(PREFIX)) return null;
  // remove sempre (uso único), mesmo se expirado
  await db
    .delete(verificationTokens)
    .where(and(eq(verificationTokens.identifier, row.identifier), eq(verificationTokens.token, tokenHash)));

  if (row.expires.getTime() < Date.now()) return null;
  return row.identifier.slice(PREFIX.length);
}
