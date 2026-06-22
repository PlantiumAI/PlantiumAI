"use client";

import Link from "next/link";
import Image from "next/image";
import { useActionState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { requestPasswordReset, type ResetRequestState } from "./actions";

export default function RecuperarSenhaPage() {
  const [state, formAction, pending] = useActionState<ResetRequestState, FormData>(
    requestPasswordReset,
    {},
  );

  return (
    <div className="grid min-h-dvh place-items-center px-5 py-10">
      <div className="w-full max-w-md rounded-3xl glass p-7 shadow-glass sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <span className="inline-flex items-center gap-2.5 font-display font-700">
            <Image src="/logo-plantiumai.png" alt="Logo PlantiumAI" width={36} height={36} className="h-9 w-9 rounded-full object-cover shadow-glass" />
            <span className="text-lg tracking-tight">Plantium<span className="text-brand">AI</span></span>
          </span>
          <ThemeToggle />
        </div>

        <h1 className="font-display text-2xl font-700">Esqueceu a senha?</h1>
        <p className="mt-1 text-sm text-muted">Informe seu e-mail e enviaremos um link seguro para criar uma nova senha.</p>

        {state.done ? (
          <div className="mt-6 flex flex-col gap-4">
            <p className="rounded-xl bg-brand/10 px-4 py-3 text-sm text-brand">{state.message}</p>
            <Link href="/login" className="inline-flex items-center justify-center gap-2 text-sm font-600 text-brand hover:underline">
              <ArrowLeft size={16} /> Voltar ao login
            </Link>
          </div>
        ) : (
          <form action={formAction} className="mt-6 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-500">
              E-mail
              <span className="relative flex items-center">
                <Mail size={17} className="pointer-events-none absolute left-3 text-muted" />
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@plantium.ai"
                  required
                  className="w-full rounded-xl border border-black/10 bg-white/60 py-2.5 pl-10 pr-3 outline-none transition focus:border-brand dark:border-white/10 dark:bg-black/20"
                />
              </span>
            </label>
            <button
              type="submit"
              disabled={pending}
              className="mt-1 rounded-xl bg-brand py-2.5 font-600 text-white shadow-glass transition hover:bg-brand-deep disabled:opacity-60"
            >
              {pending ? "Enviando…" : "Enviar link de redefinição"}
            </button>
            <Link href="/login" className="inline-flex items-center justify-center gap-2 text-sm text-muted hover:text-brand">
              <ArrowLeft size={16} /> Voltar ao login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
