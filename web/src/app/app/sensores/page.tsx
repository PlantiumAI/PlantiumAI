import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { deviceTokens, locations, sensors } from "@/db/schema";
import { DemoSensores } from "@/components/app/demo-sensores";
import { SensorForm } from "@/components/sensor-form";
import { SENSOR_TYPE_META, type SensorTypeKey } from "@/lib/sensor-types";
import { createSensor, deleteSensor } from "./actions";

export const dynamic = "force-dynamic";

/**
 * Sensores: com cadastro real → lista do banco (tipo, local, token) e CRUD;
 * sem cadastro → demonstração rotulada.
 */
export default async function SensoresPage() {
  const session = await auth();
  const companyId = session?.user?.companyId ?? null;
  const isEmpresa = session?.user?.role === "empresa";

  const sens = companyId
    ? await db
        .select()
        .from(sensors)
        .where(eq(sensors.companyId, companyId))
        .orderBy(desc(sensors.createdAt))
    : [];

  const [locs, tokens] = companyId
    ? await Promise.all([
        db
          .select({ id: locations.id, name: locations.name })
          .from(locations)
          .where(eq(locations.companyId, companyId)),
        db
          .select({
            id: deviceTokens.id,
            label: deviceTokens.label,
            prefix: deviceTokens.prefix,
          })
          .from(deviceTokens)
          .where(eq(deviceTokens.companyId, companyId)),
      ])
    : [[], []];

  if (!companyId || sens.length === 0) {
    return (
      <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {isEmpresa && companyId && (
          <div className="rounded-2xl glass p-5">
            <h2 className="font-display text-lg font-600">Adicionar primeiro sensor</h2>
            <p className="mt-1 text-sm text-muted">
              Cadastre o sensor físico da estufa para sair do modo demonstração.
            </p>
            <div className="mt-4">
              <SensorForm action={createSensor} locations={locs} tokens={tokens} />
            </div>
          </div>
        )}
        <div className="pl-card pl-card--solid" style={{ padding: "12px 18px", display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--pl-text-muted)" }}>
          <span className="pl-chip pl-chip--atencao"><span className="pl-chip__dot" />Modo demonstração</span>
          <span>Os sensores abaixo são simulados.</span>
        </div>
        <DemoSensores />
      </section>
    );
  }

  const locName = new Map(locs.map((l) => [l.id, l.name]));

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <h1 className="pl-font-display pl-page-title" style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "-.01em" }}>Sensores</h1>
        <p style={{ margin: 0, fontSize: 14, color: "var(--pl-text-muted)" }}>
          {sens.length} sensor(es) cadastrado(s) · {sens.filter((s) => s.active).length} ativo(s)
        </p>
      </div>

      <div className="pl-card pl-card--solid" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--pl-text-muted)", borderBottom: "1px solid var(--pl-border-subtle)" }}>
              <th style={{ padding: "12px 16px", fontWeight: 500 }}>Nome</th>
              <th style={{ padding: "12px 16px", fontWeight: 500 }}>Tipo</th>
              <th style={{ padding: "12px 16px", fontWeight: 500 }}>Local</th>
              <th style={{ padding: "12px 16px", fontWeight: 500 }}>Status</th>
              {isEmpresa && <th style={{ padding: "12px 16px", fontWeight: 500 }}>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {sens.map((s) => {
              const meta = SENSOR_TYPE_META[s.type as SensorTypeKey];
              return (
                <tr key={s.id} style={{ borderBottom: "1px solid var(--pl-border-subtle)" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 600 }}>{s.name}</td>
                  <td style={{ padding: "12px 16px", color: "var(--pl-text-muted)" }}>{meta?.label ?? s.type}</td>
                  <td style={{ padding: "12px 16px", color: "var(--pl-text-muted)" }}>
                    {s.locationId ? locName.get(s.locationId) ?? "—" : "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span className={"pl-chip " + (s.active ? "pl-chip--ideal" : "pl-chip--atencao")}>
                      <span className="pl-chip__dot" />{s.active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  {isEmpresa && (
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Link href={`/app/sensores/${s.id}/editar`} className="pl-btn pl-btn--secondary pl-btn--sm">Editar</Link>
                        <form action={deleteSensor}>
                          <input type="hidden" name="id" value={s.id} />
                          <button className="pl-btn pl-btn--sm" style={{ color: "var(--pl-danger)" }}>Remover</button>
                        </form>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isEmpresa && (
        <div className="rounded-2xl glass p-5">
          <h2 className="font-display text-lg font-600">Adicionar sensor</h2>
          <div className="mt-4">
            <SensorForm action={createSensor} locations={locs} tokens={tokens} />
          </div>
        </div>
      )}
    </section>
  );
}
