import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText, Download, ExternalLink } from "lucide-react";
import "../landing.css";

export const metadata: Metadata = {
  title: "Documentos — PlantiumAI",
  description:
    "Documentos oficiais do projeto PlantiumAI: trabalho científico e materiais técnicos, para visualização e download.",
};

const PDF = "/docs/trabalho-cientifico-plantiumai.pdf";

export default function DocumentosPage() {
  return (
    <div className="min-h-screen bg-[#070d0a] text-[#eaf3ee] transition-colors duration-300 relative overflow-x-hidden font-sans selection:bg-[#34d977] selection:text-[#06120b] plf-root">
      {/* Glow Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-180px] right-[-120px] w-[560px] h-[560px] rounded-full bg-radial-gradient from-emerald-500/8 to-transparent filter blur-[40px] opacity-60"></div>
        <div className="absolute bottom-[-220px] left-[-160px] w-[600px] h-[600px] rounded-full bg-radial-gradient from-teal-500/8 to-transparent filter blur-[40px] opacity-60"></div>
      </div>

      {/* Header */}
      <header className="fixed top-[18px] left-0 right-0 z-40 max-w-[1180px] mx-auto px-6">
        <nav className="relative flex items-center justify-between gap-4 px-6 py-3 rounded-full bg-[#14261c]/55 border border-[#78c896]/14 backdrop-blur-xl shadow-lg">
          <Link href="/#topo" className="flex items-center gap-3 font-semibold text-lg tracking-tight font-display text-[#eaf3ee] hover:opacity-90 transition">
            <img
              src="/logo-plantiumai.png"
              alt="Logo PlantiumAI"
              width={38}
              height={38}
              className="block rounded-full object-cover shadow shadow-black/40"
            />
            <span className="plf-nav-title">PlantiumAI</span>
          </Link>

          {/* Toggle do menu mobile: CSS puro (checkbox hack), funciona sem JS */}
          <input type="checkbox" id="plf-nav-toggle" className="plf-nav-toggle" aria-hidden tabIndex={-1} />

          <div className="flex-1 flex justify-center gap-1 plf-tabs">
            <Link href="/#solucao" className="px-3 py-2 rounded-full text-xs font-semibold text-[#9fb4a8] hover:text-[#eaf3ee] hover:bg-[#16281e]/60 transition-colors">Solução</Link>
            <Link href="/#demo-video" className="px-3 py-2 rounded-full text-xs font-semibold text-[#9fb4a8] hover:text-[#eaf3ee] hover:bg-[#16281e]/60 transition-colors">PlantiumAI</Link>
            <Link href="/#tecnologia" className="px-3 py-2 rounded-full text-xs font-semibold text-[#9fb4a8] hover:text-[#eaf3ee] hover:bg-[#16281e]/60 transition-colors">Tecnologia</Link>
            <Link href="/#mercado" className="px-3 py-2 rounded-full text-xs font-semibold text-[#9fb4a8] hover:text-[#eaf3ee] hover:bg-[#16281e]/60 transition-colors">Mercado</Link>
            <Link href="/#equipe" className="px-3 py-2 rounded-full text-xs font-semibold text-[#9fb4a8] hover:text-[#eaf3ee] hover:bg-[#16281e]/60 transition-colors">Equipe</Link>
            <Link href="/#contato" className="px-3 py-2 rounded-full text-xs font-semibold text-[#9fb4a8] hover:text-[#eaf3ee] hover:bg-[#16281e]/60 transition-colors">Contato</Link>
            <Link href="/planos" className="px-3 py-2 rounded-full text-xs font-semibold text-[#9fb4a8] hover:text-[#eaf3ee] hover:bg-[#16281e]/60 transition-colors">Planos</Link>
            <Link href="/documentos" className="px-3 py-2 rounded-full text-xs font-semibold text-[#eaf3ee] bg-[#16281e]/80 border border-emerald-500/10 transition-colors">Documentos</Link>
          </div>

          <div className="plf-nav-right flex items-center gap-4">
            <Link
              href="/#topo"
              className="plf-desktop-only flex items-center gap-1.5 text-xs font-semibold text-[#9fb4a8] hover:text-emerald-400 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Início
            </Link>
            <Link
              href="/login"
              className="plf-login-btn px-4 py-2 rounded-full bg-[#22c55e] text-[#06120b] text-xs font-bold hover:bg-[#16a34a] transition-all shadow-[0_4px_14px_rgba(52,217,119,0.3)] hover:scale-[1.02]"
            >
              Login
            </Link>
            <label htmlFor="plf-nav-toggle" className="plf-hamburger" role="button" aria-label="Abrir menu" tabIndex={0}>
              <svg className="plf-burger-open" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
              <svg className="plf-burger-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
            </label>
          </div>

          {/* Backdrop p/ fechar tocando fora */}
          <label htmlFor="plf-nav-toggle" className="plf-nav-backdrop" aria-hidden></label>

          {/* Menu mobile (hambúrguer) */}
          <div id="plf-mobile-menu" className="plf-mobile-menu">
            <Link href="/#solucao">Solução</Link>
            <Link href="/#demo-video">PlantiumAI</Link>
            <Link href="/#tecnologia">Tecnologia</Link>
            <Link href="/#mercado">Mercado</Link>
            <Link href="/#equipe">Equipe</Link>
            <Link href="/#contato">Contato</Link>
            <Link href="/planos">Planos</Link>
            <Link href="/documentos">Documentos</Link>
            <Link href="/login" className="plf-mm-login">Entrar no painel</Link>
          </div>
        </nav>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider text-emerald-400">
            Documentos
          </span>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl mt-6 tracking-tight leading-tight text-[#eaf3ee]">
            Documentação do projeto
          </h1>
          <p className="text-[#9fb4a8] text-lg mt-4 leading-relaxed font-normal">
            Materiais oficiais do PlantiumAI. Visualize diretamente no site ou baixe o arquivo em PDF.
          </p>
        </div>

        {/* Card do documento */}
        <article className="rounded-3xl border border-[#78c896]/12 bg-[#12211a]/30 backdrop-blur-md shadow-2xl shadow-black/40 overflow-hidden">
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5 border-b border-[#78c896]/10">
            <div className="shrink-0 grid place-items-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FileText className="w-7 h-7" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-bold text-xl sm:text-2xl text-[#eaf3ee] leading-tight">
                Trabalho Científico — PlantiumAI
              </h2>
              <p className="text-sm text-[#9fb4a8] mt-1 leading-relaxed">
                Sistema inteligente de monitoramento para micro estufas e hortas verticais com IoT, visão computacional e IA.
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6c8478] bg-[#0d1b14]/80 border border-[#78c896]/10 px-2.5 py-1 rounded-full">PDF</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6c8478] bg-[#0d1b14]/80 border border-[#78c896]/10 px-2.5 py-1 rounded-full">Engenharia de Software · 2026</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href={PDF}
                download
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-[#34d977] to-teal-500 text-slate-950 hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.01] transition-all"
              >
                <Download className="w-4 h-4" />
                Baixar PDF
              </a>
              <a
                href={PDF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold border border-emerald-500/20 text-[#eaf3ee] hover:bg-emerald-500/5 hover:border-emerald-500/40 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir em nova aba
              </a>
            </div>
          </div>

          {/* Visualizador embutido */}
          <div className="p-3 sm:p-4 bg-[#0d1b14]/40">
            <iframe
              src={`${PDF}#view=FitH`}
              title="Trabalho Científico — PlantiumAI (PDF)"
              className="w-full h-[68vh] min-h-[420px] rounded-2xl border border-[#78c896]/10 bg-[#0d1b14]"
            />
            <p className="text-xs text-[#6c8478] text-center mt-3 sm:hidden">
              Se o documento não carregar aqui no celular, use &ldquo;Abrir em nova aba&rdquo; ou &ldquo;Baixar PDF&rdquo;.
            </p>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-500/10 py-8 bg-[#050a07] relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-[#9fb4a8]">
          <span>© 2026 PlantiumAI · Micro estufas e hortas verticais inteligentes · ThyagoToledo</span>
          <div className="flex gap-4">
            <Link href="/" className="hover:text-emerald-400 transition">Início</Link>
            <Link href="/planos" className="hover:text-emerald-400 transition">Planos</Link>
            <Link href="/login" className="hover:text-emerald-400 transition">Entrar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
