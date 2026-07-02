import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { actuators, automationRules, devices, locations } from "@/db/schema";
import { AutomationForm } from "@/components/automation-form";
import { actionSchema, triggerSchema } from "@/lib/automation";
import { deleteRule, toggleRule } from "./actions";

export const dynamic = "force-dynamic";

const METRIC_LABEL: Record<string, string> = {
  soil_moisture: "umidade do solo",
  air_temperature: "temperatura do ar",
  air_humidity: "umidade do ar",
  light_level: "luminosidade",
  soil_temperature: "temperatura do solo",
  co2_level: "CO₂",
  ph_level: "pH",
};
const OP_LABEL: Record<string, string> = {
  lt: "<", lte: "≤", gt: ">", gte: "≥",
};
const CMD_LABEL: Record<string, string> = {
  on: "ligar", off: "desligar", set_level: "intensidade",
};

/** Descreve trigger/action em português para a listagem. */
function describe(rule: { trigger: unknown; action: unknown }, actName: string) {
  const t = triggerSchema.safeParse(rule.trigger);
  const a = actionSchema.safeParse(rule.action);
  const cond = !t.success
    ? "condição inválida"
    : t.data.kind === "sensor"
      ? `${METRIC_LABEL[t.data.metric] ?? t.data.metric} ${OP_LABEL[t.data.op]} ${t.data.value}`
      : `todo dia às ${t.data.time}`;
  const act = !a.success
    ? "ação inválida"
    : `${CMD_LABEL[a.data.command] ?? a.data.command}${a.data.command === "set_level" && a.data.level != null ? ` ${a.data.level}%` : ""} ${actName}${a.data.durationS ? ` por ${a.data.durationS}s` : ""}`;
  return { cond, act };
}

export default async function AutomacoesPage() {
  const session = await auth();
  if (session!.user.role !== "empresa") redirect("/app");
  const companyId = session!.user.companyId;

  if (!companyId) {
    return (
      <div className="rounded-2xl glass p-8 text-center text-muted">
        Conta sem empresa vinculada.
      </div>
    );
  }

  let rules: (typeof automationRules.$inferSelect)[] = [];
  let acts: Array<{ id: string; name: string; deviceName: string }> = [];
  let locs: Array<{ id: string; name: string }> = [];
  let migrationPending = false;

  try {
    [rules, locs] = await Promise.all([
      db
        .select()
        .from(automationRules)
        .where(eq(automationRules.companyId, companyId))
        .orderBy(desc(automationRules.createdAt)),
      db
        .select({ id: locations.id, name: locations.name })
        .from(locations)
        .where(eq(locations.companyId, companyId)),
    ]);
    acts = (
      await db
        .select({
          id: actuators.id,
          name: actuators.name,
          deviceName: devices.name,
        })
        .from(actuators)
        .innerJoin(devices, eq(actuators.deviceId, devices.id))
        .where(eq(actuators.companyId, companyId))
    ).map((a) => ({ ...a, deviceName: a.deviceName ?? "device" }));
  } catch (err) {
    console.error("automacoes: migração 0001 pendente?", err);
    migrationPending = true;
  }

  if (migrationPending) {
    return (
      <div className="rounded-2xl glass p-8 text-center text-muted">
        O banco ainda não tem as tabelas de automação. Aplique a migração{" "}
        <code>web/drizzle/0001_iot_devices.sql</code> no Neon.
      </div>
    );
  }

  const locName = new Map(locs.map((l) => [l.id, l.name]));
  const actName = new Map(acts.map((a) => [a.id, a.name]));

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-2xl font-700">Automações</h1>
        <p className="text-sm text-muted">
          Regras que controlam a estufa sozinhas: irrigação por umidade,
          ventilação por temperatura, fotoperíodo do LED por horário.
        </p>
      </header>

      {acts.length === 0 ? (
        <section className="rounded-2xl glass p-8 text-center text-muted">
          Cadastre primeiro um dispositivo com atuadores em{" "}
          <a href="/app/dispositivos" className="font-600 text-brand">Dispositivos</a>{" "}
          — as regras precisam de algo para acionar.
        </section>
      ) : (
        <AutomationForm locations={locs} actuators={acts} />
      )}

      <section className="flex flex-col gap-3">
        {rules.map((r) => {
          const a = actionSchema.safeParse(r.action);
          const name = a.success ? actName.get(a.data.actuatorId) ?? "atuador" : "atuador";
          const d = describe(r, name);
          return (
            <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl glass p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-600">{r.name}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-600 ${r.enabled ? "bg-brand/10 text-brand" : "bg-black/10 text-muted"}`}>
                    {r.enabled ? "ativa" : "pausada"}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-muted">
                  Se {d.cond} → {d.act}
                  {r.locationId ? ` · ${locName.get(r.locationId) ?? ""}` : " · todos os locais"}
                  {` · cooldown ${r.cooldownS}s`}
                </p>
                <p className="text-xs text-muted">
                  {r.lastFiredAt
                    ? `Último disparo: ${r.lastFiredAt.toLocaleString("pt-BR")}`
                    : "Nunca disparou"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <form action={toggleRule}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-600 transition hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10">
                    {r.enabled ? "Pausar" : "Ativar"}
                  </button>
                </form>
                <form action={deleteRule}>
                  <input type="hidden" name="id" value={r.id} />
                  <button className="rounded-lg border border-danger/30 px-3 py-1.5 text-xs font-600 text-danger transition hover:bg-danger/10">
                    Remover
                  </button>
                </form>
              </div>
            </div>
          );
        })}
        {rules.length === 0 && acts.length > 0 && (
          <div className="rounded-2xl glass p-8 text-center text-muted">
            Nenhuma regra ainda. Crie a primeira acima — ex.: “se umidade do
            solo &lt; 30%, ligar bomba por 60s”.
          </div>
        )}
      </section>
    </div>
  );
}
