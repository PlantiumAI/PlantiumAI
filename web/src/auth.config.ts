import type { NextAuthConfig } from "next-auth";

// Config compartilhada e segura para o edge (sem bcrypt/DB).
// O provider Credentials (Node-only) é adicionado em auth.ts.
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [],
  callbacks: {
    // Usado pelo middleware para proteger rotas.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnApp = nextUrl.pathname.startsWith("/app");

      if (isOnApp) return isLoggedIn; // /app/* exige login

      // Logado tentando ver login/signup → manda pro app
      if (
        isLoggedIn &&
        (nextUrl.pathname === "/login" || nextUrl.pathname === "/signup")
      ) {
        return Response.redirect(new URL("/app", nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Contas OAuth (Google) chegam sem role/companyId → default seguro.
        token.role = (user as { role?: string }).role ?? "cliente";
        token.companyId = (user as { companyId?: string | null }).companyId ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "empresa" | "cliente";
        session.user.companyId = (token.companyId as string | null) ?? null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
