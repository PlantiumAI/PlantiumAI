"use client";

import { useActionState } from "react";
import type { LocationFormState } from "@/app/app/locais/actions";

const field =
  "rounded-xl border border-black/10 bg-white/60 px-3 py-2.5 outline-none focus:border-brand dark:border-white/10 dark:bg-black/20";

type Action = (
  prev: LocationFormState,
  formData: FormData,
) => Promise<LocationFormState>;

export function LocationForm({
  action,
  initial,
  submitLabel = "Adicionar local",
}: {
  action: Action;
  initial?: { id: string; name: string; type: string; description: string | null };
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState<LocationFormState, FormData>(
    action,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      <label className="flex flex-1 flex-col gap-1.5 text-sm font-500">
        Nome
        <input name="name" required defaultValue={initial?.name} className={field} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-500">
        Tipo
        <select name="type" defaultValue={initial?.type ?? "estufa"} className={field}>
          <option value="estufa">Estufa</option>
          <option value="plantacao_vertical">Plantação vertical</option>
          <option value="container">Container</option>
        </select>
      </label>
      <label className="flex flex-[2] flex-col gap-1.5 text-sm font-500">
        Descrição (opcional)
        <input name="description" defaultValue={initial?.description ?? ""} className={field} />
      </label>
      <button
        disabled={pending}
        className="rounded-xl bg-brand px-5 py-2.5 font-600 text-white shadow-glass transition hover:bg-brand-deep disabled:opacity-60"
      >
        {pending ? "Salvando…" : submitLabel}
      </button>
      {state.error && (
        <p className="w-full rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}
    </form>
  );
}
