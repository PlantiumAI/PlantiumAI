"use client";

import { useActionState } from "react";
import { Copy, Cpu, KeyRound, Plug } from "lucide-react";
import {
  createActuator,
  createDevice,
  createDeviceLinkedToken,
  type FormState,
  type TokenState,
} from "@/app/app/dispositivos/actions";

const inputCls =
  "rounded-xl border border-black/10 bg-white/60 px-3 py-2.5 outline-none focus:border-brand dark:border-white/10 dark:bg-black/20";
const btnCls =
  "rounded-xl bg-brand px-5 py-2.5 font-600 text-white shadow-glass transition hover:bg-brand-deep disabled:opacity-60";

/** Cadastro de dispositivo físico (ESP32/gateway) em uma estufa. */
export function DeviceForm({
  locations,
}: {
  locations: Array<{ id: string; name: string }>;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createDevice,
    {},
  );

  return (
    <div className="rounded-2xl glass p-5">
      <h2 className="flex items-center gap-2 font-display text-lg font-600">
        <Cpu size={18} className="text-brand" /> Registrar dispositivo
      </h2>
      <p className="mt-1 text-sm text-muted">
        Cada ESP32 (ou gateway) instalado na estufa vira um dispositivo. Depois
        de registrar, gere o token e grave-o no firmware.
      </p>

      <form action={formAction} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
        <input
          name="name"
          required
          minLength={2}
          placeholder="Nome (ex.: ESP32 — Estufa 1)"
          className={inputCls}
        />
        <select name="model" className={inputCls} defaultValue="esp32">
          <option value="esp32">ESP32</option>
          <option value="esp32cam">ESP32-CAM</option>
          <option value="gateway">Gateway</option>
        </select>
        <select name="locationId" className={inputCls} defaultValue="">
          <option value="">Sem local</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
        <button disabled={pending} className={btnCls}>
          {pending ? "Registrando…" : "Registrar"}
        </button>
      </form>

      {state.error && (
        <p className="mt-3 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}
    </div>
  );
}

/** Gera (e regenera) o token do device — exibido uma única vez. */
export function DeviceTokenGenerator({
  deviceId,
  hasToken,
}: {
  deviceId: string;
  hasToken: boolean;
}) {
  const [state, formAction, pending] = useActionState<TokenState, FormData>(
    createDeviceLinkedToken,
    {},
  );

  return (
    <div>
      <form action={formAction} className="inline">
        <input type="hidden" name="deviceId" value={deviceId} />
        <button
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-lg border border-brand/40 px-3 py-1.5 text-xs font-600 text-brand transition hover:bg-brand/10 disabled:opacity-60"
        >
          <KeyRound size={13} />
          {pending
            ? "Gerando…"
            : hasToken
              ? "Regenerar token (revoga o atual)"
              : "Gerar token do firmware"}
        </button>
      </form>

      {state.error && (
        <p className="mt-2 rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">
          {state.error}
        </p>
      )}
      {state.token && (
        <div className="mt-2 rounded-xl border border-brand/40 bg-brand/5 p-3">
          <p className="text-xs font-600 text-brand">
            Copie agora — não será exibido novamente:
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <code className="flex-1 overflow-x-auto rounded-lg bg-black/80 px-3 py-2 font-mono text-xs text-leaf-200">
              {state.token}
            </code>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(state.token!)}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg glass"
              aria-label="Copiar token"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Cadastro de atuador (bomba, válvula, ventilação, LED…) em um device. */
export function ActuatorForm({ deviceId }: { deviceId: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createActuator,
    {},
  );

  return (
    <div>
      <form action={formAction} className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
        <input type="hidden" name="deviceId" value={deviceId} />
        <input
          name="name"
          required
          minLength={2}
          placeholder="Nome (ex.: Bomba de irrigação)"
          className={`${inputCls} text-sm`}
        />
        <select name="type" className={`${inputCls} text-sm`} defaultValue="pump">
          <option value="pump">Bomba</option>
          <option value="valve">Válvula</option>
          <option value="fan">Ventilação</option>
          <option value="exhaust">Exaustão</option>
          <option value="led_panel">Painel LED</option>
          <option value="relay">Relé</option>
          <option value="heater">Aquecedor</option>
        </select>
        <input
          name="channel"
          type="number"
          min={0}
          max={64}
          defaultValue={0}
          title="Canal físico (GPIO/relé/PWM)"
          className={`${inputCls} w-24 text-sm`}
        />
        <button
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-xl border border-brand/40 px-4 py-2 text-sm font-600 text-brand transition hover:bg-brand/10 disabled:opacity-60"
        >
          <Plug size={14} /> {pending ? "Adicionando…" : "Adicionar atuador"}
        </button>
      </form>
      {state.error && (
        <p className="mt-2 rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">
          {state.error}
        </p>
      )}
    </div>
  );
}
