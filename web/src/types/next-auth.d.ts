import type { DefaultSession } from "next-auth";

// Estende a sessão/JWT com os campos da plataforma (papel + empresa).
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "empresa" | "cliente";
      companyId: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: "empresa" | "cliente";
    companyId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: "empresa" | "cliente";
    companyId?: string | null;
  }
}
