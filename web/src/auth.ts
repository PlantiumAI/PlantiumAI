import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { eq, or } from "drizzle-orm";
import { z } from "zod";
import { authConfig } from "./auth.config";
import { db } from "./db";
import { users } from "./db/schema";
import { verifyPassword } from "./lib/password";

const credsSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
});

// Provider Google é adicionado SÓ se as credenciais existirem — assim a app
// não quebra quando AUTH_GOOGLE_ID/SECRET ainda não foram configurados.
const providers: NextAuthConfig["providers"] = [];
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      // Só confiar no email do Google (que vem verificado) — sem auto-link perigoso.
      allowDangerousEmailAccountLinking: false,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...providers,
    Credentials({
      credentials: { login: {}, password: {} },
      async authorize(raw) {
        const parsed = credsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { login, password } = parsed.data;

        const [u] = await db
          .select()
          .from(users)
          .where(or(eq(users.login, login), eq(users.email, login)))
          .limit(1);

        if (!u?.passwordHash) return null;
        const ok = await verifyPassword(password, u.passwordHash);
        if (!ok) return null;

        return {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          companyId: u.companyId,
        };
      },
    }),
  ],
});
