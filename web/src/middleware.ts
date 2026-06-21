import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Middleware de autenticação (edge). Aplica o callback `authorized`.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Roda em todas as rotas exceto assets estáticos e a API.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico)$).*)"],
};
