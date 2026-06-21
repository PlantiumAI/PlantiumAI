import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { Pencil } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db";
import { deviceTokens, locations, sensors } from "@/db/schema";
import { SensorForm } from "@/components/sensor-form";
import { DeleteForm } from "@/components/delete-form";
import { SENSOR_TYPE_META, type SensorTypeKey } from "@/lib/sensor-types";
import { createSensor, deleteSensor } from "./actions";

export default async function SensoresPage() {
  const session = await auth();
  const companyId = session!.user.companyId;

  const [rows, locs, toks] = companyId
    ? await Promise.all([
        db
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
          .orderBy(desc(sensors.createdAt)),
        db
          .select({ id: locations.id, name: locations.name })
          .from(locations)
          .where(eq(locations.companyId, companyId)),
        db
          .select({ id: deviceTokens.id, label: deviceTokens.label, prefix: deviceTokens.prefix })
          .from(deviceTokens)
          .where(eq(deviceTokens.companyId, companyId)),
      ])
    : [[], [], []];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-700">Sensores</h1>
        <p className="text-sm text-muted">
          Dispositivos instalados, seu tipo e local. Clique para ver o dashboard.
        </p>
      </header>

      <section className="rounded-2xl glass p-5">
        <h2 className="mb-3 font-display text-base font-600">Novo sensor</h2>
        <SensorForm action={createSensor} locations={locs} tokens={toks} />
      </section>

      <section className="overflow-hidden rounded-2xl glass">
        <table className="w-full text-sm">
          <thead className="border-b border-black/5 text-left text-muted dark:border-white/10">
            <tr>
              <th className="px-4 py-3 font-500">Sensor</th>
              <th className="px-4 py-3 font-500">Tipo</th>
              <th className="px-4 py-3 font-500">Local</th>
              <th className="px-4 py-3 font-500">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  Nenhum sensor cadastrado ainda.
                </td>
              </tr>
            )}
            {rows.map((s) => (
              <tr key={s.id} className="border-b border-black/5 last:border-0 dark:border-white/10">
                <td className="px-4 py-3 font-500">
                  <Link href={`/app/sensores/${s.id}`} className="hover:text-brand">
                    {s.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">
                  {SENSOR_TYPE_META[s.type as SensorTypeKey]?.label ?? s.type}
                </td>
                <td className="px-4 py-3 text-muted">{s.location ?? "—"}</td>
                <td className="px-4 py-3">
                  {s.active ? (
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand">ativo</span>
                  ) : (
                    <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs text-muted dark:bg-white/10">inativo</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/app/sensores/${s.id}/editar`}
                      aria-label="Editar"
                      className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-black/5 hover:text-brand dark:hover:bg-white/10"
                    >
                      <Pencil size={15} />
                    </Link>
                    <DeleteForm action={deleteSensor} id={s.id} confirmLabel={`Excluir "${s.name}"?`} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
