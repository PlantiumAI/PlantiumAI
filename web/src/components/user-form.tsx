"use client";

import { useActionState } from "react";
import { Copy } from "lucide-react";
import { createUser, type UserFormState } from "@/app/app/usuarios/actions";

const field =
  "rounded-xl border border-black/10 bg-white/60 px-3 py-2.5 outline-none focus:border-brand dark:border-white/10 dark:bg-black/20";

export function UserForm() {
  const [state, formAction, pending] = useActionState<UserFormState, FormData>(
    createUser,
    {},
  );

  return (
    <div>
      <form action={formAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-500">
          Nome
          <input name="name" required className={field} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-500">
          E-mail
          <input name="email" type="email" required className={field} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-500">
          Login
          <input name="login" required className={field} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-500">
          Tipo de conta
          <select name="role" defaultValue="cliente" className={field}>
            <option value="cliente">Cliente (somente leitura)</option>
            <option value="empresa">Empresa (gestão)</option>
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-500 sm:col-span-2">
          Senha (opcional — em branco gera uma temporária)
          <input name="password" type="text" autoComplete="off" className={field} />
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
          {pending ? "Criando…" : "Adicionar usuário"}
        </button>
      </form>

      {state.tempPassword && (
        <div className="mt-4 rounded-xl border border-brand/40 bg-brand/5 p-4">
          <p className="text-xs font-600 text-brand">
            Senha temporária — copie e envie ao usuário (não será exibida de novo):
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-black/80 px-3 py-2 font-mono text-sm text-leaf-200">
              {state.tempPassword}
            </code>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(state.tempPassword!)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg glass"
              aria-label="Copiar senha"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
