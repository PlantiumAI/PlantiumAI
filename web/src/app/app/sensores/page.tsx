import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { locations, sensors } from "@/db/schema";

export default async function SensoresPage() {
  const session = await auth();
  const companyId = session!.user.companyId;

  const rows = companyId
    ? await db
        .select({
          id: sensors.id,
          name: sensors.name,
          type: sensors.type,
          active: sensors.active,
          location: locations.name,
        })
        .from(sensors)
        .leftJoin(locations, eq(sensors.locationId, locations.id))
        .where(eq(sensors.companyId, companyId))
    : [];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-700">Sensores</h1>
        <p className="text-sm text-muted">
          Dispositivos instalados e o local de cada um.
        </p>
      </header>

      <section className="overflow-hidden rounded-2xl glass">
        <table className="w-full text-sm">
          <thead className="border-b border-black/5 text-left text-muted dark:border-white/10">
            <tr>
              <th className="px-4 py-3 font-500">Sensor</th>
              <th className="px-4 py-3 font-500">Tipo</th>
              <th className="px-4 py-3 font-500">Local</th>
              <th className="px-4 py-3 font-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  Nenhum sensor cadastrado ainda.
                </td>
              </tr>
            )}
            {rows.map((s) => (
              <tr key={s.id} className="border-b border-black/5 last:border-0 dark:border-white/10">
                <td className="px-4 py-3 font-500">{s.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{s.type}</td>
                <td className="px-4 py-3 text-muted">{s.location ?? "—"}</td>
                <td className="px-4 py-3">
                  {s.active ? (
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand">ativo</span>
                  ) : (
                    <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs text-muted dark:bg-white/10">inativo</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
