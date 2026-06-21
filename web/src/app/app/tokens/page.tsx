import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { deviceTokens } from "@/db/schema";
import { TokenGenerator } from "@/components/token-generator";

export default async function TokensPage() {
  const session = await auth();
  const companyId = session!.user.companyId;

  const tokens = companyId
    ? await db
        .select()
        .from(deviceTokens)
        .where(eq(deviceTokens.companyId, companyId))
        .orderBy(desc(deviceTokens.createdAt))
    : [];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-700">Tokens de dispositivo</h1>
        <p className="text-sm text-muted">
          Credenciais que autenticam cada sensor na plataforma.
        </p>
      </header>

      <TokenGenerator />

      <section className="overflow-hidden rounded-2xl glass">
        <table className="w-full text-sm">
          <thead className="border-b border-black/5 text-left text-muted dark:border-white/10">
            <tr>
              <th className="px-4 py-3 font-500">Rótulo</th>
              <th className="px-4 py-3 font-500">Prefixo</th>
              <th className="px-4 py-3 font-500">Status</th>
              <th className="px-4 py-3 font-500">Criado</th>
            </tr>
          </thead>
          <tbody>
            {tokens.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  Nenhum token ainda. Gere o primeiro acima.
                </td>
              </tr>
            )}
            {tokens.map((t) => (
              <tr key={t.id} className="border-b border-black/5 last:border-0 dark:border-white/10">
                <td className="px-4 py-3">{t.label ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs">plt_{t.prefix}…</td>
                <td className="px-4 py-3">
                  {t.revoked ? (
                    <span className="rounded-full bg-danger/10 px-2 py-0.5 text-xs text-danger">revogado</span>
                  ) : (
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand">ativo</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted">
                  {t.createdAt.toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
