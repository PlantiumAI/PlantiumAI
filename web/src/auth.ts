import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
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

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
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
