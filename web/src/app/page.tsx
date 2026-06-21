import Link from "next/link";
import { Activity, Cpu, Leaf, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

const features = [
  {
    icon: Activity,
    title: "Monitoramento em tempo real",
    desc: "Umidade do solo, temperatura, CO₂, pH e luz — leituras contínuas dos seus sensores IoT.",
  },
  {
    icon: Cpu,
    title: "Decisão assistida por IA",
    desc: "Recomendações de irrigação com fallback por regras locais quando a IA está indisponível.",
  },
  {
    icon: ShieldCheck,
    title: "Tokens de dispositivo seguros",
    desc: "Cada sensor recebe um token único que identifica o dono e protege a comunicação.",
  },
  {
    icon: Leaf,
    title: "Estufas, vertical e containers",
    desc: "Organize seus locais de cultivo e acompanhe os dados de cada ambiente em um só lugar.",
  },
];

export default function LandingPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl flex-col px-5 sm:px-8">
      {/* Header */}
      <header className="sticky top-4 z-10 mt-4 flex items-center justify-between rounded-full glass px-4 py-2.5 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-600 transition hover:bg-black/5 dark:hover:bg-white/10"
          >
            Entrar
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-brand px-4 py-2 text-sm font-600 text-white shadow-glass transition hover:bg-brand-deep"
          >
            Criar conta
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col">
        <section className="grid place-items-center py-16 text-center sm:py-24">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs font-600 text-muted">
            <span className="h-2 w-2 rounded-full bg-brand" /> Micro estufas inteligentes
          </span>
          <h1 className="max-w-3xl font-display text-4xl font-700 leading-tight sm:text-6xl">
            Dados que parecem <span className="text-brand">vivos</span>.
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted sm:text-lg">
            A PlantiumAI conecta seus sensores de cultivo à nuvem e transforma
            leituras em decisões — para estufas, plantações verticais e containers.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-full bg-brand px-6 py-3 font-600 text-white shadow-glass transition hover:bg-brand-deep"
            >
              Começar agora
            </Link>
            <Link
              href="/login"
              className="rounded-full glass px-6 py-3 font-600 transition hover:scale-[1.02]"
            >
              Já tenho conta
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="grid grid-cols-1 gap-4 pb-16 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl glass p-5">
              <f.icon className="mb-3 text-brand" size={24} />
              <h3 className="font-display text-base font-600">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-black/5 py-6 text-center text-sm text-muted dark:border-white/10">
        © {new Date().getFullYear()} PlantiumAI · Monitoramento inteligente de cultivo
      </footer>
    </div>
  );
}
