"use client";

import { useActionState } from "react";
import type { SensorFormState } from "@/app/app/sensores/actions";
import { SENSOR_TYPE_META, type SensorTypeKey } from "@/lib/sensor-types";

const field =
  "rounded-xl border border-black/10 bg-white/60 px-3 py-2.5 outline-none focus:border-brand dark:border-white/10 dark:bg-black/20";

type Action = (
  prev: SensorFormState,
  formData: FormData,
) => Promise<SensorFormState>;

export function SensorForm({
  action,
  locations,
  tokens,
  initial,
  submitLabel = "Adicionar sensor",
}: {
  action: Action;
  locations: { id: string; name: string }[];
  tokens: { id: string; label: string | null; prefix: string }[];
  initial?: {
    id: string;
    name: string;
    type: string;
    locationId: string | null;
    deviceTokenId: string | null;
  };
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState<SensorFormState, FormData>(
    action,
    {},
  );

  return (
    <form action={formAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      <label className="flex flex-col gap-1.5 text-sm font-500">
        Nome
        <input name="name" required defaultValue={initial?.name} className={field} />
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-500">
        Tipo
        <select name="type" defaultValue={initial?.type ?? "estacao_completa"} className={field}>
          {(Object.keys(SENSOR_TYPE_META) as SensorTypeKey[]).map((k) => (
            <option key={k} value={k}>
              {SENSOR_TYPE_META[k].label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-500">
        Local
        <select name="locationId" defaultValue={initial?.locationId ?? ""} className={field}>
          <option value="">— sem local —</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm font-500">
        Token de dispositivo
        <select name="deviceTokenId" defaultValue={initial?.deviceTokenId ?? ""} className={field}>
          <option value="">— sem token —</option>
          {tokens.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label ?? `plt_${t.prefix}…`}
            </option>
          ))}
        </select>
      </label>

      {state.error && (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger sm:col-span-2">
          {state.error}
        </p>
      )}

      <button
        disabled={pending}
        className="rounded-xl bg-brand px-5 py-2.5 font-600 text-white shadow-glass transition hover:bg-brand-deep disabled:opacity-60 sm:col-span-2 sm:w-fit"
      >
        {pending ? "Salvando…" : submitLabel}
      </button>
    </form>
  );
}
