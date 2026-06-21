import type { Config } from "drizzle-kit";

// Lê DATABASE_URL do ambiente (Neon). Em dev, carregue via `.env.local`.
export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
} satisfies Config;
