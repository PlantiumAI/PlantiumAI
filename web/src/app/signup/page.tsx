"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { registerCompany, type SignupState } from "./actions";

const field =
  "rounded-xl border border-black/10 bg-white/60 px-3 py-2.5 outline-none focus:border-brand dark:border-white/10 dark:bg-black/20";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState<SignupState, FormData>(
    registerCompany,
    {},
  );

  return (
    <div className="grid min-h-dvh place-items-center px-5 py-10">
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md rounded-2xl glass p-7">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Logo />
          <p className="text-sm text-muted">Crie a conta da sua empresa</p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-500">
              Seu nome
              <input name="name" required className={field} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-500">
              Empresa
              <input name="companyName" required className={field} />
            </label>
          </div>
          <label className="flex flex-col gap-1.5 text-sm font-500">
            E-mail
            <input name="email" type="email" autoComplete="email" required className={field} />
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-500">
              Login
              <input name="login" autoComplete="username" required className={field} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-500">
              Senha
              <input name="password" type="password" autoComplete="new-password" required className={field} />
            </label>
          </div>

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
            {pending ? "Criando…" : "Criar conta"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Já tem conta?{" "}
          <Link href="/login" className="font-600 text-brand hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
