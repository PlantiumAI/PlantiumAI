import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

export default async function UsuariosPage() {
  const session = await auth();
  const companyId = session!.user.companyId;

  const rows = companyId
    ? await db
        .select({
          id: users.id,
          name: users.name,
          login: users.login,
          email: users.email,
          role: users.role,
        })
        .from(users)
        .where(eq(users.companyId, companyId))
    : [];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-700">Usuários</h1>
        <p className="text-sm text-muted">Pessoas com acesso à sua empresa.</p>
      </header>

      <section className="overflow-hidden rounded-2xl glass">
        <table className="w-full text-sm">
          <thead className="border-b border-black/5 text-left text-muted dark:border-white/10">
            <tr>
              <th className="px-4 py-3 font-500">Nome</th>
              <th className="px-4 py-3 font-500">Login</th>
              <th className="px-4 py-3 font-500">E-mail</th>
              <th className="px-4 py-3 font-500">Tipo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-b border-black/5 last:border-0 dark:border-white/10">
                <td className="px-4 py-3 font-500">{u.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{u.login}</td>
                <td className="px-4 py-3 text-muted">{u.email}</td>
                <td className="px-4 py-3 capitalize">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
