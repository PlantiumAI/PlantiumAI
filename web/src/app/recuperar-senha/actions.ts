"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createResetToken } from "@/lib/password-reset";
import { passwordResetEmail, sendEmail } from "@/lib/email";

export type ResetRequestState = { done?: boolean; message?: string };

const schema = z.object({ email: z.string().email() });

// Mensagem SEMPRE genérica (anti-enumeração): não revela se o email existe.
const GENERIC = "Se houver uma conta com esse email, enviamos um link de redefinição. Verifique sua caixa de entrada e o spam.";

async function baseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function requestPasswordReset(
  _prev: ResetRequestState,
  formData: FormData,
): Promise<ResetRequestState> {
  const parsed = schema.safeParse({ email: String(formData.get("email") ?? "").trim().toLowerCase() });
  if (!parsed.success) return { done: true, message: GENERIC };
  const email = parsed.data.email;

  try {
    const [u] = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (u) {
      const raw = await createResetToken(email);
      const link = `${await baseUrl()}/redefinir-senha?token=${raw}`;
      const { subject, html, text } = passwordResetEmail(link);
      await sendEmail({ to: email, subject, html, text });
    }
  } catch (e) {
    // Não vaza detalhes ao usuário; loga p/ diagnóstico.
    console.error("[reset] erro ao processar pedido", e);
  }
  return { done: true, message: GENERIC };
}
