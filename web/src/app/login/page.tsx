"use client";

import Link from "next/link";
import Image from "next/image";
import { useActionState, useState } from "react";
import { Eye, EyeOff, Lock, Mail, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { authenticate, loginWithGoogle, type LoginState } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    authenticate,
    {},
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="grid min-h-dvh place-items-center px-5 py-10">
      <div className="w-full max-w-md rounded-3xl glass p-7 shadow-glass sm:p-8">
        {/* Cabeçalho do card: marca + ações */}
        <div className="mb-6 flex items-center justify-between">
          <span className="inline-flex items-center gap-2.5 font-display font-700">
            <Image
              src="/logo-plantiumai.png"
              alt="Logo PlantiumAI"
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover shadow-glass"
            />
            <span className="text-lg tracking-tight">
              Plantium<span className="text-brand">AI</span>
            </span>
          </span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/"
              aria-label="Fechar e voltar ao início"
              className="grid h-9 w-9 place-items-center rounded-full glass transition hover:scale-105"
            >
              <X size={16} />
            </Link>
          </div>
        </div>

        <h1 className="font-display text-2xl font-700">Bem-vindo de volta</h1>
        <p className="mt-1 text-sm text-muted">Acesse o painel das suas estufas</p>

        <form action={formAction} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-500">
            E-mail
            <span className="relative flex items-center">
              <Mail
                size={17}
                className="pointer-events-none absolute left-3 text-muted"
              />
              <input
                name="login"
                type="text"
                inputMode="email"
                autoComplete="username"
                placeholder="voce@plantium.ai"
                required
                className="w-full rounded-xl border border-black/10 bg-white/60 py-2.5 pl-10 pr-3 outline-none transition focus:border-brand dark:border-white/10 dark:bg-black/20"
              />
            </span>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-500">
            Senha
            <span className="relative flex items-center">
              <Lock
                size={17}
                className="pointer-events-none absolute left-3 text-muted"
              />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Mínimo 8 caracteres"
                minLength={8}
                required
                className="w-full rounded-xl border border-black/10 bg-white/60 py-2.5 pl-10 pr-10 outline-none transition focus:border-brand dark:border-white/10 dark:bg-black/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className="absolute right-3 text-muted transition hover:opacity-70"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </label>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted">
              <input
                type="checkbox"
                name="remember"
                className="h-4 w-4 rounded border-black/20 accent-brand dark:border-white/20"
              />
              Lembrar-me
            </label>
            <Link
              href="/recuperar-senha"
              className="font-500 text-brand hover:underline"
            >
              Esqueci a senha
            </Link>
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
            {pending ? "Entrando…" : "Entrar"}
          </button>
        </form>

        {/* Divisor */}
        <div className="my-5 flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
          ou
          <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
        </div>

        <form action={loginWithGoogle}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-black/10 bg-white/60 py-2.5 font-500 transition hover:bg-white/80 dark:border-white/10 dark:bg-black/20 dark:hover:bg-black/30"
          >
            <GoogleIcon />
            Entrar com Google
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Não tem conta?{" "}
          <Link href="/signup" className="font-600 text-brand hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}
