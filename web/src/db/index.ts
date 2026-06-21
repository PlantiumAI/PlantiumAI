import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

type DB = ReturnType<typeof drizzle<typeof schema>>;

// Inicialização preguiçosa: só conecta no Neon quando o `db` é realmente usado.
// Assim o `next build` não falha mesmo sem DATABASE_URL definida (ex.: primeiro
// deploy antes de configurar o banco).
let _db: DB | null = null;

function init(): DB {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL não definida. Configure no .env.local / Vercel.");
  }
  _db = drizzle(neon(url), { schema });
  return _db;
}

export const db = new Proxy({} as DB, {
  get(_target, prop, receiver) {
    return Reflect.get(init(), prop, receiver);
  },
});

export { schema };
