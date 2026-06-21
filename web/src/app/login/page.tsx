"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { authenticate, type LoginState } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    authenticate,
    {},
  );

  return (
    <div className="grid min-h-dvh place-items-center px-5">
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm rounded-2xl glass p-7">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Logo />
          <p className="text-sm text-muted">Acesse seu painel de cultivo</p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-500">
            Login ou e-mail
            <input
              name="login"
              autoComplete="username"
              required
              className="rounded-xl border border-black/10 bg-white/60 px-3 py-2.5 outline-none focus:border-brand dark:border-white/10 dark:bg-black/20"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-500">
            Senha
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="rounded-xl border border-black/10 bg-white/60 px-3 py-2.5 outline-none focus:border-brand dark:border-white/10 dark:bg-black/20"
            />
          </label>

          {state.error && (
            <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-1 rounded-xl bg-brand py-2.5 font-600 text-white shadow-glass transition hover:bg-brand-deep disabled:opacity-60"
          >
            {pending ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Não tem conta?{" "}
          <Link href="/signup" className="font-600 text-brand hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
