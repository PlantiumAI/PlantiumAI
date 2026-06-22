"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { Check, Eye, EyeOff, Lock } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { resetPassword, type ResetState } from "./actions";

function ResetForm() {
  const token = useSearchParams().get("token") ?? "";
  const [state, formAction, pending] = useActionState<ResetState, FormData>(resetPassword, {});
  const [show, setShow] = useState(false);

  return (
    <div className="w-full max-w-md rounded-3xl glass p-7 shadow-glass sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <span className="inline-flex items-center gap-2.5 font-display font-700">
          <Image src="/logo-plantiumai.png" alt="Logo PlantiumAI" width={36} height={36} className="h-9 w-9 rounded-full object-cover shadow-glass" />
          <span className="text-lg tracking-tight">Plantium<span className="text-brand">AI</span></span>
        </span>
        <ThemeToggle />
      </div>

      <h1 className="font-display text-2xl font-700">Criar nova senha</h1>
      <p className="mt-1 text-sm text-muted">Escolha uma nova senha para sua conta.</p>

      {state.ok ? (
        <div className="mt-6 flex flex-col gap-4">
          <p className="flex items-center gap-2 rounded-xl bg-brand/10 px-4 py-3 text-sm text-brand">
            <Check size={16} /> Senha redefinida com sucesso.
          </p>
          <Link href="/login" className="rounded-xl bg-brand py-2.5 text-center font-600 text-white shadow-glass transition hover:bg-brand-deep">
            Entrar
          </Link>
        </div>
      ) : !token ? (
        <p className="mt-6 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
          Link inválido. Solicite uma nova redefinição em <Link href="/recuperar-senha" className="font-600 underline">recuperar senha</Link>.
        </p>
      ) : (
        <form action={formAction} className="mt-6 flex flex-col gap-4">
          <input type="hidden" name="token" value={token} />
          <label className="flex flex-col gap-1.5 text-sm font-500">
            Nova senha
            <span className="relative flex items-center">
              <Lock size={17} className="pointer-events-none absolute left-3 text-muted" />
              <input
                name="password"
                type={show ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                required
                className="w-full rounded-xl border border-black/10 bg-white/60 py-2.5 pl-10 pr-10 outline-none transition focus:border-brand dark:border-white/10 dark:bg-black/20"
              />
              <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Ocultar" : "Mostrar"} className="absolute right-3 text-muted transition hover:opacity-70">
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-500">
            Confirmar senha
            <span className="relative flex items-center">
              <Lock size={17} className="pointer-events-none absolute left-3 text-muted" />
              <input
                name="confirm"
                type={show ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Repita a senha"
                minLength={8}
                required
                className="w-full rounded-xl border border-black/10 bg-white/60 py-2.5 pl-10 pr-3 outline-none transition focus:border-brand dark:border-white/10 dark:bg-black/20"
              />
            </span>
          </label>

          {state.error && <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>}

          <button type="submit" disabled={pending} className="mt-1 rounded-xl bg-brand py-2.5 font-600 text-white shadow-glass transition hover:bg-brand-deep disabled:opacity-60">
            {pending ? "Salvando…" : "Redefinir senha"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <div className="grid min-h-dvh place-items-center px-5 py-10">
      <Suspense fallback={<div className="text-sm text-muted">Carregando…</div>}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
