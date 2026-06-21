"use client";

import { useActionState } from "react";
import { Copy, KeyRound } from "lucide-react";
import { createToken, type TokenState } from "@/app/app/tokens/actions";

export function TokenGenerator() {
  const [state, formAction, pending] = useActionState<TokenState, FormData>(
    createToken,
    {},
  );

  return (
    <div className="rounded-2xl glass p-5">
      <h2 className="flex items-center gap-2 font-display text-lg font-600">
        <KeyRound size={18} className="text-brand" /> Gerar token de dispositivo
      </h2>
      <p className="mt-1 text-sm text-muted">
        Grave o token no firmware do ESP32. Ele identifica o dono do sensor e
        protege a comunicação. O valor é mostrado <strong>uma única vez</strong>.
      </p>

      <form action={formAction} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          name="label"
          placeholder="Rótulo (ex.: Estufa 1 — ESP32)"
          className="flex-1 rounded-xl border border-black/10 bg-white/60 px-3 py-2.5 outline-none focus:border-brand dark:border-white/10 dark:bg-black/20"
        />
        <button
          disabled={pending}
          className="rounded-xl bg-brand px-5 py-2.5 font-600 text-white shadow-glass transition hover:bg-brand-deep disabled:opacity-60"
        >
          {pending ? "Gerando…" : "Gerar"}
        </button>
      </form>

      {state.error && (
        <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}

      {state.token && (
        <div className="mt-4 rounded-xl border border-brand/40 bg-brand/5 p-4">
          <p className="text-xs font-600 text-brand">
            Copie agora — não será exibido novamente:
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded-lg bg-black/80 px-3 py-2 font-mono text-sm text-leaf-200">
              {state.token}
            </code>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(state.token!)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg glass"
              aria-label="Copiar token"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
