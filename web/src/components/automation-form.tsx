"use client";

import { useActionState, useState } from "react";
import { Zap } from "lucide-react";
import { createRule, type RuleFormState } from "@/app/app/automacoes/actions";

const field =
  "rounded-xl border border-black/10 bg-white/60 px-3 py-2.5 outline-none focus:border-brand dark:border-white/10 dark:bg-black/20";

const METRICS = [
  ["soil_moisture", "Umidade do solo (%)"],
  ["air_temperature", "Temperatura do ar (°C)"],
  ["air_humidity", "Umidade do ar (%)"],
  ["light_level", "Luminosidade (lux)"],
  ["soil_temperature", "Temperatura do solo (°C)"],
  ["co2_level", "CO₂ (ppm)"],
  ["ph_level", "pH"],
] as const;

const OPS = [
  ["lt", "menor que"],
  ["lte", "menor ou igual a"],
  ["gt", "maior que"],
  ["gte", "maior ou igual a"],
] as const;

/** Formulário de criação de regra de automação (sensor ou horário → ação). */
export function AutomationForm({
  locations,
  actuators,
}: {
  locations: Array<{ id: string; name: string }>;
  actuators: Array<{ id: string; name: string; deviceName: string }>;
}) {
  const [state, formAction, pending] = useActionState<RuleFormState, FormData>(
    createRule,
    {},
  );
  const [kind, setKind] = useState<"sensor" | "schedule">("sensor");
  const [command, setCommand] = useState("on");

  return (
    <div className="rounded-2xl glass p-5">
      <h2 className="flex items-center gap-2 font-display text-lg font-600">
        <Zap size={18} className="text-brand" /> Nova regra de automação
      </h2>
      <p className="mt-1 text-sm text-muted">
        Quando a condição for atingida, o comando é enviado ao atuador
        automaticamente — sem depender de IA ou de você estar online.
      </p>

      <form action={formAction} className="mt-4 flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5 text-sm font-500">
            Nome da regra
            <input name="name" required minLength={2} placeholder="Ex.: Irrigar solo seco" className={field} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-500">
            Local (opcional)
            <select name="locationId" defaultValue="" className={field}>
              <option value="">Todos os locais</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-500">
            Intervalo mínimo entre disparos (s)
            <input name="cooldownS" type="number" min={0} max={86400} defaultValue={300} className={field} />
          </label>
        </div>

        <fieldset className="rounded-xl border border-black/10 p-4 dark:border-white/10">
          <legend className="px-2 text-sm font-600">Condição (gatilho)</legend>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="triggerKind"
                value="sensor"
                checked={kind === "sensor"}
                onChange={() => setKind("sensor")}
              />
              Leitura de sensor
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="triggerKind"
                value="schedule"
                checked={kind === "schedule"}
                onChange={() => setKind("schedule")}
              />
              Horário diário
            </label>
          </div>

          {kind === "sensor" ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <select name="metric" defaultValue="soil_moisture" className={field}>
                {METRICS.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
              <select name="op" defaultValue="lt" className={field}>
                {OPS.map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
              <input name="value" type="number" step="any" required={kind === "sensor"} placeholder="Valor limite (ex.: 30)" className={field} />
            </div>
          ) : (
            <div className="mt-3">
              <label className="flex max-w-xs flex-col gap-1.5 text-sm font-500">
                Horário (Brasília)
                <input name="time" type="time" required={kind === "schedule"} defaultValue="06:00" className={field} />
              </label>
            </div>
          )}
        </fieldset>

        <fieldset className="rounded-xl border border-black/10 p-4 dark:border-white/10">
          <legend className="px-2 text-sm font-600">Ação</legend>
          <div className="grid gap-3 sm:grid-cols-4">
            <select name="actuatorId" required className={field}>
              <option value="">Escolha o atuador…</option>
              {actuators.map((a) => (
                <option key={a.id} value={a.id}>{a.name} ({a.deviceName})</option>
              ))}
            </select>
            <select name="command" value={command} onChange={(e) => setCommand(e.target.value)} className={field}>
              <option value="on">Ligar</option>
              <option value="off">Desligar</option>
              <option value="set_level">Definir intensidade</option>
            </select>
            {command === "set_level" && (
              <input name="level" type="number" min={0} max={100} defaultValue={50} placeholder="Intensidade %" className={field} />
            )}
            <input name="durationS" type="number" min={1} max={3600} placeholder="Duração (s, opcional)" className={field} />
          </div>
        </fieldset>

        <div className="flex items-center gap-3">
          <button
            disabled={pending}
            className="rounded-xl bg-brand px-5 py-2.5 font-600 text-white shadow-glass transition hover:bg-brand-deep disabled:opacity-60"
          >
            {pending ? "Criando…" : "Criar regra"}
          </button>
          {state.error && (
            <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>
          )}
          {state.ok && <p className="text-sm text-brand">Regra criada.</p>}
        </div>
      </form>
    </div>
  );
}
