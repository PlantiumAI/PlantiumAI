"use client";

import Link from "next/link";
import Image from "next/image";
import { useActionState, useState } from "react";
import { AtSign, Building2, Eye, EyeOff, Lock, Mail, User, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { registerCompany, type SignupState } from "./actions";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState<SignupState, FormData>(
    registerCompany,
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

        <h1 className="font-display text-2xl font-700">Criar conta</h1>
        <p className="mt-1 text-sm text-muted">Crie a conta da sua empresa</p>

        <form action={formAction} className="mt-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-500">
              Seu nome
              <span className="relative flex items-center">
                <User size={17} className="pointer-events-none absolute left-3 text-muted" />
                <input
                  name="name"
                  autoComplete="name"
                  placeholder="Maria Silva"
                  required
                  className="w-full rounded-xl border border-black/10 bg-white/60 py-2.5 pl-10 pr-3 outline-none transition focus:border-brand dark:border-white/10 dark:bg-black/20"
                />
              </span>
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-500">
              Empresa
              <span className="relative flex items-center">
                <Building2 size={17} className="pointer-events-none absolute left-3 text-muted" />
                <input
                  name="companyName"
                  placeholder="Fazenda Boa Vista"
                  required
                  className="w-full rounded-xl border border-black/10 bg-white/60 py-2.5 pl-10 pr-3 outline-none transition focus:border-brand dark:border-white/10 dark:bg-black/20"
                />
              </span>
            </label>
          </div>

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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm font-500">
              Login
              <span className="relative flex items-center">
                <AtSign size={17} className="pointer-events-none absolute left-3 text-muted" />
                <input
                  name="login"
                  autoComplete="username"
                  placeholder="maria.silva"
                  required
                  className="w-full rounded-xl border border-black/10 bg-white/60 py-2.5 pl-10 pr-3 outline-none transition focus:border-brand dark:border-white/10 dark:bg-black/20"
                />
              </span>
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-500">
              Senha
              <span className="relative flex items-center">
                <Lock size={17} className="pointer-events-none absolute left-3 text-muted" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                  required
                  className="w-full rounded-xl border border-black/10 bg-white/60 py-2.5 pl-10 pr-10 outline-none transition focus:border-brand dark:border-white/10 dark:bg-black/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-3 text-muted transition hover:text-base"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </span>
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

        <p className="mt-6 text-center text-sm text-muted">
          Já tem conta?{" "}
          <Link href="/login" className="font-600 text-brand hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
