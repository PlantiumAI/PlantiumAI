"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type LoginState = { error?: string };

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
