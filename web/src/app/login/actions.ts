"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";

export type LoginState = { error?: string };

// Inicia o fluxo OAuth do Google. Se as credenciais não estiverem configuradas,
// volta ao login com um aviso em vez de quebrar.
export async function loginWithGoogle() {
  if (!process.env.AUTH_GOOGLE_ID) redirect("/login?google=unavailable");
  await signIn("google", { redirectTo: "/app" });
}

export async function authenticate(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  try {
    await signIn("credentials", {
      login: formData.get("login"),
      password: formData.get("password"),
      redirectTo: "/app",
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Login ou senha inválidos." };
    }
    // `signIn` lança um redirect em caso de sucesso — repropaga.
    throw error;
  }
}
