import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { UserForm } from "@/components/user-form";
import { DeleteForm } from "@/components/delete-form";
import { deleteUser } from "./actions";

export default async function UsuariosPage() {
  const session = await auth();
  const companyId = session!.user.companyId;
  const isManager = session!.user.role === "empresa";
  const meId = session!.user.id;

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
        .orderBy(desc(users.createdAt))
    : [];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-700">Usuários</h1>
        <p className="text-sm text-muted">Pessoas com acesso à sua empresa.</p>
      </header>

      {isManager && (
        <section className="rounded-2xl glass p-5">
          <h2 className="mb-3 font-display text-base font-600">Novo usuário</h2>
          <UserForm />
        </section>
      )}

      <section className="overflow-hidden rounded-2xl glass">
        <table className="w-full text-sm">
          <thead className="border-b border-black/5 text-left text-muted dark:border-white/10">
            <tr>
              <th className="px-4 py-3 font-500">Nome</th>
              <th className="px-4 py-3 font-500">Login</th>
              <th className="px-4 py-3 font-500">E-mail</th>
              <th className="px-4 py-3 font-500">Tipo</th>
              {isManager && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-b border-black/5 last:border-0 dark:border-white/10">
                <td className="px-4 py-3 font-500">
                  {u.name}
                  {u.id === meId && <span className="ml-2 text-xs text-muted">(você)</span>}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{u.login}</td>
                <td className="px-4 py-3 text-muted">{u.email}</td>
                <td className="px-4 py-3 capitalize">{u.role}</td>
                {isManager && (
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      {u.id !== meId && (
                        <DeleteForm action={deleteUser} id={u.id} confirmLabel={`Excluir "${u.name}"?`} />
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
