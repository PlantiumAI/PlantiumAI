"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { and, eq, ne, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { requireCompany } from "@/lib/session";

export type UserFormState = { error?: string; tempPassword?: string };

const schema = z.object({
  name: z.string().min(2, "Informe o nome."),
  login: z
    .string()
    .min(3, "Login deve ter ao menos 3 caracteres.")
    .regex(/^[a-zA-Z0-9_.-]+$/, "Use apenas letras, números, . _ -"),
  email: z.string().email("E-mail inválido."),
  role: z.enum(["empresa", "cliente"]),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres.").optional(),
});

export async function createUser(
  _prev: UserFormState,
  formData: FormData,
): Promise<UserFormState> {
  const ctx = await requireCompany();
  if ("error" in ctx) return { error: ctx.error };

  const parsed = schema.safeParse({
    name: formData.get("name"),
    login: formData.get("login"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const { name, login, email, role } = parsed.data;

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(or(eq(users.login, login), eq(users.email, email)))
    .limit(1);
  if (existing) return { error: "Login ou e-mail já cadastrado." };

  // Senha informada, ou uma temporária gerada (mostrada uma única vez).
  const generated = parsed.data.password
    ? null
    : randomBytes(9).toString("base64url");
  const plain = parsed.data.password ?? generated!;
  const passwordHash = await hashPassword(plain);

  await db.insert(users).values({
    name,
    login,
    email,
    role,
    passwordHash,
    companyId: ctx.companyId,
  });

  revalidatePath("/app/usuarios");
  return generated ? { tempPassword: generated } : {};
}

export async function deleteUser(formData: FormData): Promise<void> {
  const ctx = await requireCompany();
  if ("error" in ctx) return;
  const id = String(formData.get("id") ?? "");
  if (!id || id === ctx.userId) return; // não pode excluir a si mesmo
  await db
    .delete(users)
    .where(and(eq(users.id, id), eq(users.companyId, ctx.companyId), ne(users.id, ctx.userId)));
  revalidatePath("/app/usuarios");
}
