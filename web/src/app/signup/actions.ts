"use server";

import { eq, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { companies, users } from "@/db/schema";
import { hashPassword } from "@/lib/password";
import { signIn } from "@/auth";

export type SignupState = { error?: string };

const schema = z.object({
  name: z.string().min(2, "Informe seu nome."),
  companyName: z.string().min(2, "Informe o nome da empresa."),
  email: z.string().email("E-mail inválido."),
  login: z
    .string()
    .min(3, "Login deve ter ao menos 3 caracteres.")
    .regex(/^[a-zA-Z0-9_.-]+$/, "Use apenas letras, números, . _ -"),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres."),
});

export async function registerCompany(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { name, companyName, email, login, password } = parsed.data;

  // Unicidade de login/e-mail
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(or(eq(users.login, login), eq(users.email, email)))
    .limit(1);
  if (existing) {
    return { error: "Login ou e-mail já cadastrado." };
  }

  const passwordHash = await hashPassword(password);

  // Cria a empresa e o usuário admin (papel empresa).
  const [company] = await db
    .insert(companies)
    .values({ name: companyName, email })
    .returning({ id: companies.id });

  await db.insert(users).values({
    name,
    login,
    email,
    passwordHash,
    role: "empresa",
    companyId: company.id,
  });

  // Autentica e redireciona para o app.
  await signIn("credentials", { login, password, redirectTo: "/app" });
  return {};
}
