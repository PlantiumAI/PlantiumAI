"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { consumeResetToken } from "@/lib/password-reset";
import { hashPassword } from "@/lib/password";

export type ResetState = { ok?: boolean; error?: string };

const schema = z
  .object({
    token: z.string().min(32),
    password: z.string().min(8, "A senha deve ter no mínimo 8 caracteres."),
    confirm: z.string().min(8),
  })
  .refine((d) => d.password === d.confirm, { message: "As senhas não coincidem.", path: ["confirm"] });

export async function resetPassword(_prev: ResetState, formData: FormData): Promise<ResetState> {
  const parsed = schema.safeParse({
    token: String(formData.get("token") ?? ""),
    password: String(formData.get("password") ?? ""),
    confirm: String(formData.get("confirm") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const email = await consumeResetToken(parsed.data.token);
  if (!email) {
    return { error: "Link inválido ou expirado. Solicite uma nova redefinição." };
  }

  try {
    const hash = await hashPassword(parsed.data.password);
    await db.update(users).set({ passwordHash: hash }).where(eq(users.email, email));
  } catch (e) {
    console.error("[reset] erro ao gravar nova senha", e);
    return { error: "Não foi possível redefinir a senha. Tente novamente." };
  }
  return { ok: true };
}
