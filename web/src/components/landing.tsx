"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "../app/landing.css";

/* Landing institucional — design importado do Claude Design
   (projeto "PlantiumAI Landing"). Markup mantido fiel ao canvas: estilos
   inline preservados; diretivas do canvas (sc-for/sc-if/style-hover) foram
   resolvidas para HTML estático + classes (ver landing.css). CTAs apontam
   para o app existente (/login). */

const HTML = `
<div style="min-height:100vh; background:var(--bg-gradient); color:var(--text-base); font-family:'Inter',sans-serif; transition:background-color .3s ease,color .3s ease; overflow-x:hidden;">

  <!-- ambient orbs -->
  <div style="position:fixed; inset:0; pointer-events:none; z-index:0; overflow:hidden;">
    <div style="position:absolute; top:-180px; right:-120px; width:560px; height:560px; border-radius:50%; background:radial-gradient(circle, rgba(52,217,119,0.16), transparent 70%); filter:blur(22px);"></div>
    <div style="position:absolute; bottom:-220px; left:-160px; width:600px; height:600px; border-radius:50%; background:radial-gradient(circle, rgba(20,184,166,0.12), transparent 70%); filter:blur(22px);"></div>
  </div>

  <!-- NAVBAR -->
  <div style="position:fixed; top:18px; left:0; right:0; z-index:40; padding:0 16px;">
    <nav class="plf-nav" style="position:relative; max-width:1180px; margin:0 auto; display:flex; align-items:center; gap:20px; padding:9px 12px 9px 14px; background:var(--surface-glass); -webkit-backdrop-filter:blur(18px); backdrop-filter:blur(18px); border:1px solid var(--border-glass); border-radius:999px; box-shadow:var(--shadow-soft);">
      <a href="#topo" style="display:flex; align-items:center; gap:11px; font-family:'Sora',sans-serif; font-weight:700; font-size:18px; letter-spacing:-0.01em;">
        <img src="/logo-plantiumai.png" alt="Logo PlantiumAI" width="38" height="38" style="display:block; width:38px; height:38px; border-radius:50%; object-fit:cover; box-shadow:0 4px 14px rgba(0,0,0,0.4);"/>
        <span class="plf-nav-title">PlantiumAI</span>
      </a>
      <!-- Toggle do menu mobile: CSS puro (checkbox hack), funciona sem JS -->
      <input type="checkbox" id="plf-nav-toggle" class="plf-nav-toggle" aria-hidden="true" tabindex="-1">
      <div style="flex:1; display:flex; justify-content:center; gap:4px;" class="plf-tabs">
        <a href="#solucao" style="padding:8px 13px; border-radius:999px; font-size:14px; font-weight:500; color:var(--text-muted); transition:color .2s,background .2s;">Solução</a>
        <a href="#demo-video" style="padding:8px 13px; border-radius:999px; font-size:14px; font-weight:500; color:var(--text-muted); transition:color .2s,background .2s;">PlantiumAI</a>
        <a href="#tecnologia" style="padding:8px 13px; border-radius:999px; font-size:14px; font-weight:500; color:var(--text-muted); transition:color .2s,background .2s;">Tecnologia</a>
        <a href="#mercado" style="padding:8px 13px; border-radius:999px; font-size:14px; font-weight:500; color:var(--text-muted); transition:color .2s,background .2s;">Mercado</a>
        <a href="#equipe" style="padding:8px 13px; border-radius:999px; font-size:14px; font-weight:500; color:var(--text-muted); transition:color .2s,background .2s;">Equipe</a>
        <a href="#parceiros" style="padding:8px 13px; border-radius:999px; font-size:14px; font-weight:500; color:var(--text-muted); transition:color .2s,background .2s;">Parceiros</a>
        <a href="#contato" style="padding:8px 13px; border-radius:999px; font-size:14px; font-weight:500; color:var(--text-muted); transition:color .2s,background .2s;">Contato</a>
        <a href="/planos" style="padding:8px 13px; border-radius:999px; font-size:14px; font-weight:500; color:var(--text-muted); transition:color .2s,background .2s;">Planos</a>
        <a href="/documentos" style="padding:8px 13px; border-radius:999px; font-size:14px; font-weight:500; color:var(--text-muted); transition:color .2s,background .2s;">Documentos</a>
      </div>
      <div class="plf-nav-right" style="display:flex; align-items:center; gap:8px;">
        <a href="/login" class="plf-btn-primary plf-login-btn" style="padding:10px 18px; border-radius:999px; border:none; background:var(--brand-green); color:#06120b; font-family:'Inter',sans-serif; font-size:14px; font-weight:600; cursor:pointer; box-shadow:0 4px 14px rgba(52,217,119,0.3); transition:transform .15s, background .2s;">Login</a>
        <label for="plf-nav-toggle" class="plf-hamburger" role="button" aria-label="Abrir menu" tabindex="0">
          <svg class="plf-burger-open" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
          <svg class="plf-burger-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
        </label>
      </div>
      <!-- Backdrop p/ fechar tocando fora (label do mesmo checkbox) -->
      <label for="plf-nav-toggle" class="plf-nav-backdrop" aria-hidden="true"></label>
      <!-- Menu mobile (hambúrguer) -->
      <div id="plf-mobile-menu" class="plf-mobile-menu">
        <a href="#solucao">Solução</a>
        <a href="#demo-video">PlantiumAI</a>
        <a href="#tecnologia">Tecnologia</a>
        <a href="#mercado">Mercado</a>
        <a href="#equipe">Equipe</a>
        <a href="#contato">Contato</a>
        <a href="/planos">Planos</a>
        <a href="/documentos">Documentos</a>
        <a href="/login" class="plf-mm-login">Entrar no painel</a>
      </div>
    </nav>
  </div>

  <!-- HERO -->
  <header id="topo" style="position:relative; z-index:1; overflow:hidden;">
    <div style="position:absolute; inset:0; background-image:url('/landing/hero.jpg'); background-size:cover; background-position:center; opacity:0.9;"></div>
    <div style="position:absolute; inset:0; background:var(--hero-veil);"></div>
    <div style="position:relative; max-width:1180px; margin:0 auto; padding:106px 24px 48px; display:grid; grid-template-columns:1.05fr 1fr; gap:48px; align-items:center;" class="plf-hero">
      <div id="solucao">
        <div style="display:flex; flex-wrap:wrap; gap:8px;">
          <span style="display:inline-flex; align-items:center; gap:7px; padding:6px 13px; border-radius:999px; background:var(--surface-glass); -webkit-backdrop-filter:blur(14px); backdrop-filter:blur(14px); border:1px solid var(--border-glass); font-size:12.5px; font-weight:600; color:var(--text-base);"><span style="width:7px; height:7px; border-radius:50%; background:var(--brand-green);"></span>Desafio AgroStartup — 10 Anos (SENAR, SEBRAE, FAPEG, Goiás 2026)</span>
        </div>
        <h1 style="font-family:'Sora',sans-serif; font-weight:700; font-size:clamp(38px,4.8vw,60px); line-height:1.06; letter-spacing:-0.02em; margin:22px 0 0;">
          PlantiumAI
        </h1>
        <p style="font-size:18px; line-height:1.62; color:var(--text-muted); max-width:520px; margin:20px 0 0;">
          Inteligência Conversacional e IoT Offline-First para Horticultura Controlada
        </p>
        <div style="font-family:'Sora',sans-serif; font-size:22px; font-weight:700; color:var(--brand-green); margin-top:20px; letter-spacing:-0.01em;">
          "A planta nunca fica no escuro."
        </div>
        <div style="display:flex; gap:14px; margin-top:30px; flex-wrap:wrap;">
          <a href="#tecnologia" class="plf-btn-primary" style="display:inline-flex; align-items:center; gap:8px; padding:14px 26px; border-radius:999px; border:none; background:var(--brand-green); color:#06120b; font-family:'Inter',sans-serif; font-size:15px; font-weight:600; cursor:pointer; box-shadow:0 8px 22px rgba(52,217,119,0.3); transition:transform .15s, background .2s;">
            Conhecer o protótipo
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
          <a href="/login" class="plf-btn-ghost" style="display:inline-flex; align-items:center; gap:8px; padding:14px 26px; border-radius:999px; background:var(--surface-glass); -webkit-backdrop-filter:blur(14px); backdrop-filter:blur(14px); border:1px solid var(--border-glass); color:var(--text-base); font-size:15px; font-weight:600; cursor:pointer; box-shadow:var(--shadow-soft); transition:transform .15s;">Falar com um especialista</a>
        </div>
        <div style="display:flex; gap:28px; margin-top:38px; flex-wrap:wrap;">
          <div><div style="font-family:'Sora',sans-serif; font-weight:700; font-size:28px;">R$ 1.010<span style="font-size:16px; color:var(--text-muted);">,08</span></div><div style="font-size:13px; color:var(--text-muted);">kit do protótipo / unidade</div></div>
          <div style="width:1px; background:var(--border-subtle);"></div>
          <div><div style="font-family:'Sora',sans-serif; font-weight:700; font-size:28px;">offline<span style="font-size:16px; color:var(--text-muted);">-first</span></div><div style="font-size:13px; color:var(--text-muted);">decisão local sem nuvem</div></div>
          <div style="width:1px; background:var(--border-subtle);"></div>
          <div><div style="font-family:'Sora',sans-serif; font-weight:700; font-size:28px;">~15<span style="font-size:16px; color:var(--text-muted);">% a.a.</span></div><div style="font-size:13px; color:var(--text-muted);">crescimento do setor*</div></div>
        </div>
      </div>

      <!-- DASHBOARD PREVIEW -->
      <div style="position:relative;" class="plf-preview">
        <div style="position:absolute; inset:-26px; border-radius:36px; background:var(--photo-1); opacity:0.55; filter:blur(2px);"></div>
        <div style="position:relative; padding:18px; border-radius:28px; background:var(--surface-glass); -webkit-backdrop-filter:blur(18px); backdrop-filter:blur(18px); border:1px solid var(--border-glass); box-shadow:var(--shadow-float); animation:plf-float 7s ease-in-out infinite;">
          <div style="display:flex; align-items:center; justify-content:space-between; padding:4px 6px 14px;">
            <div>
              <div style="font-family:'Sora',sans-serif; font-weight:600; font-size:16px;">Estufa · Nó A101</div>
              <div style="font-size:12px; color:var(--text-faint);">Monitoramento em tempo real</div>
            </div>
            <div style="display:inline-flex; padding:4px; border-radius:999px; background:var(--surface-raised); gap:2px;">
              <span style="padding:5px 11px; border-radius:999px; font-size:12px; font-weight:600; color:var(--text-muted);">12h</span>
              <span style="padding:5px 11px; border-radius:999px; font-size:12px; font-weight:600; background:var(--brand-green-tint); color:var(--brand-green);">24h</span>
              <span style="padding:5px 11px; border-radius:999px; font-size:12px; font-weight:600; color:var(--text-muted);">Semana</span>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:1.1fr 1fr; gap:12px;">
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:18px; border-radius:18px; background:var(--surface-solid); box-shadow:var(--shadow-soft);">
              <div style="position:relative; width:132px; height:132px;">
                <svg width="132" height="132" viewBox="0 0 132 132" style="transform:rotate(-90deg);">
                  <circle cx="66" cy="66" r="56" fill="none" stroke="var(--border-subtle)" stroke-width="12"/>
                  <defs><linearGradient id="plfg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#34d977"/><stop offset="1" stop-color="#16a34a"/></linearGradient></defs>
                  <circle cx="66" cy="66" r="56" fill="none" stroke="url(#plfg)" stroke-width="12" stroke-linecap="round" stroke-dasharray="351.9" stroke-dashoffset="74"/>
                </svg>
                <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                  <div style="font-family:'Sora',sans-serif; font-weight:700; font-size:34px; line-height:1; color:var(--brand-green);">79<span style="font-size:18px;">%</span></div>
                  <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">Health score</div>
                </div>
              </div>
              <div style="display:inline-flex; align-items:center; gap:6px; margin-top:12px; padding:4px 10px; border-radius:999px; background:var(--success-tint); color:var(--brand-green); font-size:12px; font-weight:600;"><span style="width:7px; height:7px; border-radius:50%; background:var(--brand-green);"></span>Umidade ótima</div>
            </div>
            <div style="display:grid; grid-template-rows:1fr 1fr; gap:12px;">
              <div style="padding:14px; border-radius:16px; background:var(--surface-solid); box-shadow:var(--shadow-soft);">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="display:inline-flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:999px; background:var(--brand-green-tint); color:var(--brand-green);"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/></svg></span>
                  <span style="font-size:11px; font-weight:500; letter-spacing:0.04em; text-transform:uppercase; color:var(--text-muted);">Umidade solo</span>
                </div>
                <div style="font-family:'Sora',sans-serif; font-weight:700; font-size:24px; margin-top:8px;">52<span style="font-size:14px; color:var(--text-muted);">%</span></div>
              </div>
              <div style="padding:14px; border-radius:16px; background:var(--surface-solid); box-shadow:var(--shadow-soft);">
                <div style="display:flex; align-items:center; gap:8px;">
                  <span style="display:inline-flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:999px; background:var(--brand-green-tint); color:var(--brand-green);"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z"/></svg></span>
                  <span style="font-size:11px; font-weight:500; letter-spacing:0.04em; text-transform:uppercase; color:var(--text-muted);">Temp. ar</span>
                </div>
                <div style="font-family:'Sora',sans-serif; font-weight:700; font-size:24px; margin-top:8px;">24<span style="font-size:14px; color:var(--text-muted);">°C</span></div>
              </div>
            </div>
          </div>
          <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:12px;">
            <div style="padding:12px 14px; border-radius:16px; background:var(--surface-solid); box-shadow:var(--shadow-soft);">
              <div style="font-size:10px; font-weight:500; letter-spacing:0.04em; text-transform:uppercase; color:var(--text-muted);">CO₂</div>
              <div style="font-family:'Sora',sans-serif; font-weight:700; font-size:19px; margin-top:4px;">410<span style="font-size:11px; color:var(--text-muted);"> ppm</span></div>
            </div>
            <div style="padding:12px 14px; border-radius:16px; background:var(--surface-solid); box-shadow:var(--shadow-soft);">
              <div style="font-size:10px; font-weight:500; letter-spacing:0.04em; text-transform:uppercase; color:var(--text-muted);">pH solo</div>
              <div style="font-family:'Sora',sans-serif; font-weight:700; font-size:19px; margin-top:4px;">6.4</div>
            </div>
            <div style="padding:12px 14px; border-radius:16px; background:var(--surface-solid); box-shadow:var(--shadow-soft);">
              <div style="font-size:10px; font-weight:500; letter-spacing:0.04em; text-transform:uppercase; color:var(--text-muted);">Luz</div>
              <div style="font-family:'Sora',sans-serif; font-weight:700; font-size:19px; margin-top:4px;">820<span style="font-size:11px; color:var(--text-muted);"> lux</span></div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:10px; margin-top:12px; padding:11px 14px; border-radius:16px; background:var(--surface-solid); box-shadow:var(--shadow-soft);">
            <span style="display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px; border-radius:999px; border:2px solid var(--brand-green); border-top-color:transparent; animation:plf-spin 1.1s linear infinite;"></span>
            <div style="flex:1;">
              <div style="font-size:12px; font-weight:600;">Núcleo Rust avaliando irrigação</div>
              <div style="display:flex; gap:3px; margin-top:5px;">
                <span style="flex:1; height:5px; border-radius:3px; background:var(--brand-green); animation:plf-scan 1.6s ease-in-out infinite;"></span>
                <span style="flex:1; height:5px; border-radius:3px; background:var(--brand-green-soft); animation:plf-scan 1.6s ease-in-out .2s infinite;"></span>
                <span style="flex:1; height:5px; border-radius:3px; background:var(--brand-teal); animation:plf-scan 1.6s ease-in-out .4s infinite;"></span>
                <span style="flex:1; height:5px; border-radius:3px; background:var(--border-subtle);"></span>
                <span style="flex:1; height:5px; border-radius:3px; background:var(--border-subtle);"></span>
              </div>
            </div>
            <span style="font-size:11px; color:var(--brand-green); font-weight:600;">regra local OK</span>
          </div>
        </div>
      </div>
    </div>
    <!-- Elementos Institucionais no Rodapé da Dobra -->
    <div style="position:relative; z-index:2; border-top:1px solid var(--border-glass); background:rgba(6,18,11,0.5); -webkit-backdrop-filter:blur(8px); backdrop-filter:blur(8px); padding:16px 24px; margin-top:40px;">
      <div style="max-width:1180px; margin:0 auto; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; font-size:12.5px; color:var(--text-muted);">
        <div><span style="color:var(--brand-green); font-weight:600;">Institucional:</span> 1ª Turma de Engenharia de Software | SENAI Fatesg</div>
        <div><span style="color:var(--brand-green); font-weight:600;">Integrantes:</span> Thyago Henrique, João Felipe, Gabriel Augusto, Marco Antonio</div>
        <div style="display:flex; align-items:center; gap:6px;"><span style="width:7px; height:7px; border-radius:50%; background:var(--brand-green);"></span>Desafio AgroStartup — 10 Anos (SENAR, SEBRAE, FAPEG, Goiás 2026)</div>
      </div>
    </div>
  </header>

  <!-- VIDEO SCRUB -->
  <section id="demo-video" style="position:relative; z-index:1;">
    <div id="plf-video-section">
      <div id="plf-video-sticky">
        <video id="plf-video-scrub" src="/videos/PlantiumAI_site_mudo.mp4" poster="/videos/video-poster.jpg" muted playsinline preload="auto" style="position:absolute; inset:0; width:100%; height:100%; object-fit:cover;"></video>
        <div style="position:absolute; inset:0; background:linear-gradient(to bottom,rgba(8,15,11,0.55) 0%,rgba(8,15,11,0.18) 25%,rgba(8,15,11,0.18) 75%,rgba(8,15,11,0.7) 100%); pointer-events:none;"></div>


        <div id="plf-video-progress" style="position:absolute; bottom:0; left:0; height:3px; width:0%; background:var(--brand-green); z-index:3; transition:width .05s linear;"></div>
      </div>
    </div>
  </section>

  <!-- PROBLEMA -->
  <section style="position:relative; z-index:1; max-width:1180px; margin:0 auto; padding:80px 24px 40px;">
    <div style="text-align:center; max-width:760px; margin:0 auto 48px;">
      <div style="font-size:13px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:var(--brand-green);">O PROBLEMA</div>
      <h2 style="font-family:'Sora',sans-serif; font-weight:700; font-size:clamp(28px,3.4vw,40px); line-height:1.15; letter-spacing:-0.01em; margin:14px 0 16px;">O agricultor familiar decide no escuro — e paga caro por isso.</h2>
      <p style="font-size:16.5px; line-height:1.65; color:var(--text-muted); margin:0;">A ausência de sensoriamento de precisão e a interpretação empírica da biocenose geram desperdício crítico e perda de safras em micro estufas e hortas verticais. Sem dados, não há gestão — apenas intuição.</p>
    </div>
    <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:20px;" class="plf-pillars">
      <!-- Card 1 -->
      <div class="plf-card-hover" style="padding:28px; border-radius:24px; background:var(--surface-glass); -webkit-backdrop-filter:blur(14px); backdrop-filter:blur(14px); border:1px solid var(--border-glass); box-shadow:var(--shadow-soft); display:flex; flex-direction:column; gap:12px; height:100%;">
        <div style="font-family:'Sora',sans-serif; font-weight:800; font-size:52px; color:var(--brand-green); line-height:1;">40%</div>
        <p style="font-size:14px; line-height:1.55; color:var(--text-muted); margin:0;">Desperdício hídrico devido a ajustes inadequados na irrigação.</p>
        <span style="font-size:11px; color:var(--text-faint); margin-top:auto;">Fonte: EMBRAPA Horticultura/CNA 2023</span>
      </div>
      <!-- Card 2 -->
      <div class="plf-card-hover" style="padding:28px; border-radius:24px; background:var(--surface-glass); -webkit-backdrop-filter:blur(14px); backdrop-filter:blur(14px); border:1px solid var(--border-glass); box-shadow:var(--shadow-soft); display:flex; flex-direction:column; gap:12px; height:100%;">
        <div style="font-family:'Sora',sans-serif; font-weight:800; font-size:52px; color:var(--brand-green); line-height:1;">30%</div>
        <p style="font-size:14px; line-height:1.55; color:var(--text-muted); margin:0;">Perda de produtividade por identificação tardia de pragas e doenças.</p>
        <span style="font-size:11px; color:var(--text-faint); margin-top:auto;">Fonte: EMBRAPA Horticultura/CNA 2023</span>
      </div>
      <!-- Card 3 -->
      <div class="plf-card-hover" style="padding:28px; border-radius:24px; background:var(--surface-glass); -webkit-backdrop-filter:blur(14px); backdrop-filter:blur(14px); border:1px solid var(--border-glass); box-shadow:var(--shadow-soft); display:flex; flex-direction:column; gap:12px; height:100%;">
        <div style="font-family:'Sora',sans-serif; font-weight:800; font-size:36px; color:var(--brand-green); line-height:1.2;">Score 526,9</div>
        <p style="font-size:14px; line-height:1.55; color:var(--text-muted); margin:0;">O ajuste inadequado da irrigação é o gargalo nº 1 da cadeia produtiva em Goiás.</p>
        <span style="font-size:11px; color:var(--text-faint); margin-top:auto;">Fonte: IFAG 2026</span>
      </div>
    </div>
  </section>

  <!-- SOLUÇÃO / COMO FUNCIONA -->
  <section id="tecnologia" style="position:relative; z-index:1; max-width:1180px; margin:0 auto; padding:64px 24px 40px;">
    <div style="text-align:center; max-width:760px; margin:0 auto 44px;">
      <div style="font-size:13px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:var(--brand-green);">A SOLUÇÃO</div>
      <h2 style="font-family:'Sora',sans-serif; font-weight:700; font-size:clamp(28px,3.4vw,40px); line-height:1.15; letter-spacing:-0.01em; margin:14px 0 12px;">Um ecossistema de malha fechada que mantém a planta viva — mesmo sem internet.</h2>
      <div style="display:inline-flex; align-items:center; gap:8px; padding:6px 14px; border-radius:999px; background:var(--brand-green-tint); border:1px solid rgba(52,217,119,0.2); font-size:13.5px; font-weight:600; color:var(--brand-green); margin-top:8px;">
        CapEx Total do Protótipo: R$ 1.010,08
      </div>
    </div>
    <div style="display:grid; grid-template-columns:repeat(5,1fr); gap:14px; align-items:stretch;" class="plf-flow">
      ${[
        { n: "01", title: "Nós ESP32", desc: "Sensores via NDJSON (115200 baud) / MQTT Wi-Fi.", icon: '<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M10 1.5v3M14 1.5v3M10 19.5v3M14 19.5v3M1.5 10h3M1.5 14h3M19.5 10h3M19.5 14h3"/>' },
        { n: "02", title: "Núcleo Rust + tokio", desc: "Validação, domínio, regras e persistência em SQLite.", icon: '<path d="M12 2 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6z"/>' },
        { n: "03", title: "Gateway de IA", desc: "Failover com Circuit Breaker e fallback regra_local.", icon: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2"/>' },
        { n: "04", title: "Interface React/TS", desc: "Painel com ECharts em tempo real, offline-first.", icon: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 20h8M12 17v3"/>' },
        { n: "05", title: "Atuadores", desc: "Relé NF + válvula solenoide em malha fechada e segura.", icon: '<path d="M13 2 4.5 13H11l-1 9 8.5-11H12z"/>' },
      ]
        .map(
          (f) => `<div style="position:relative; padding:22px 18px; border-radius:20px; background:var(--surface-glass); -webkit-backdrop-filter:blur(14px); backdrop-filter:blur(14px); border:1px solid var(--border-glass); box-shadow:var(--shadow-soft); display:flex; flex-direction:column;">
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <span style="display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px; border-radius:12px; background:var(--brand-green-tint); color:var(--brand-green);"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${f.icon}</svg></span>
            <span style="font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--text-faint);">${f.n}</span>
          </div>
          <h3 style="font-family:'Sora',sans-serif; font-weight:600; font-size:15.5px; margin:14px 0 8px; line-height:1.25;">${f.title}</h3>
          <p style="font-size:13px; line-height:1.5; color:var(--text-muted); margin:0;">${f.desc}</p>
        </div>`,
        )
        .join("")}
    </div>
    <div style="display:flex; align-items:flex-start; gap:12px; margin-top:20px; padding:18px 20px; border-radius:18px; background:var(--brand-green-tint); border:1px solid var(--border-glass);">
      <span style="flex:none; display:inline-flex; align-items:center; justify-content:center; width:30px; height:30px; border-radius:999px; background:var(--brand-green); color:#06120b;"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg></span>
      <div>
        <div style="font-size:14.5px; font-weight:600;">Fail-safe por padrão</div>
        <p style="font-size:14px; line-height:1.55; color:var(--text-muted); margin:4px 0 0;">Padrão Circuit Breaker com fallback <code style="font-family:'JetBrains Mono',monospace; font-size:13px; color:var(--brand-green);">regra_local</code>: a malha de irrigação opera em segurança mesmo offline. Relé NF + válvula solenoide deixam o sistema seguro em caso de falha, com histórico em SQLite.</p>
      </div>
    </div>
  </section>

  <!-- SEÇÃO DE DIFERENCIAIS (3 NOVOS PILARES) -->
  <section style="position:relative; z-index:1; max-width:1180px; margin:0 auto; padding:64px 24px 40px;">
    <div style="text-align:center; max-width:640px; margin:0 auto 44px;">
      <div style="font-size:13px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:var(--brand-green);">Pilares da Engenharia</div>
      <h2 style="font-family:'Sora',sans-serif; font-weight:700; font-size:clamp(28px,3.4vw,40px); line-height:1.15; letter-spacing:-0.01em; margin:14px 0 0;">Tecnologia voltada para Resiliência e Baixo Custo</h2>
    </div>
    <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:20px;" class="plf-pillars">
      
      <!-- Card 1 -->
      <div class="plf-card-hover" style="padding:28px; border-radius:24px; background:var(--surface-glass); -webkit-backdrop-filter:blur(16px); backdrop-filter:blur(16px); border:1px solid rgba(52,217,119,0.15); box-shadow:var(--shadow-soft); display:flex; flex-direction:column; gap:16px; height:100%;">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="display:inline-flex; align-items:center; justify-content:center; width:46px; height:46px; border-radius:14px; background:var(--brand-green-tint); color:var(--brand-green);">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="2" ry="2"/>
              <rect x="6" y="6" width="12" height="12" rx="2" ry="2"/>
            </svg>
          </span>
          <div>
            <div style="font-family:'Sora',sans-serif; font-weight:600; font-size:17px; line-height:1.25;">Hardware IoT de Baixo Custo</div>
          </div>
        </div>
        <p style="font-size:14px; line-height:1.6; color:var(--text-muted); margin:0;">
          Nós distribuídos baseados em ESP32 monitorando continuamente a umidade e temperatura do solo e do ar, além da concentração de CO₂ e qualidade da exposição à luz.
        </p>
      </div>

      <!-- Card 2 -->
      <div class="plf-card-hover" style="padding:28px; border-radius:24px; background:var(--surface-glass); -webkit-backdrop-filter:blur(16px); backdrop-filter:blur(16px); border:1px solid rgba(52,217,119,0.15); box-shadow:var(--shadow-soft); display:flex; flex-direction:column; gap:16px; height:100%;">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="display:inline-flex; align-items:center; justify-content:center; width:46px; height:46px; border-radius:14px; background:var(--brand-green-tint); color:var(--brand-green);">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
            </svg>
          </span>
          <div>
            <div style="font-family:'Sora',sans-serif; font-weight:600; font-size:17px; line-height:1.25;">Suplementação Luminosa Inteligente</div>
          </div>
        </div>
        <p style="font-size:14px; line-height:1.6; color:var(--text-muted); margin:0;">
          LEDs automatizados que compensam a ausência de luz solar em ambientes fechados, emulando biomas e ciclos de crescimento ideais para cada cultura.
        </p>
      </div>

      <!-- Card 3 -->
      <div class="plf-card-hover" style="padding:28px; border-radius:24px; background:var(--surface-glass); -webkit-backdrop-filter:blur(16px); backdrop-filter:blur(16px); border:1px solid rgba(52,217,119,0.15); box-shadow:var(--shadow-soft); display:flex; flex-direction:column; gap:16px; height:100%;">
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="display:inline-flex; align-items:center; justify-content:center; width:46px; height:46px; border-radius:14px; background:var(--brand-green-tint); color:var(--brand-green);">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </span>
          <div>
            <div style="font-family:'Sora',sans-serif; font-weight:600; font-size:17px; line-height:1.25;">Engenharia Rust/Tauri 2 (Offline-First)</div>
          </div>
        </div>
        <p style="font-size:14px; line-height:1.6; color:var(--text-muted); margin:0;">
          Processamento nativo com banco SQLite local e mecanismo de Circuit Breaker: se a rede cair, o sistema continua operando e irrigando de forma autônoma.
        </p>
      </div>

    </div>
  </section>

  <!-- INTERFACE CONVERSACIONAL (WhatsApp) -->
  <section id="interface-conversacional" style="position:relative; z-index:1; max-width:1180px; margin:0 auto; padding:64px 24px 40px;">
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:48px; align-items:center;" class="plf-2col">
      <div>
        <div style="font-size:13px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:var(--brand-green);">INTERFACE CONVERSACIONAL</div>
        <h2 style="font-family:'Sora',sans-serif; font-weight:700; font-size:clamp(28px,3.4vw,40px); line-height:1.15; letter-spacing:-0.01em; margin:14px 0 16px;">O produtor gerencia toda a estufa pelo WhatsApp — em linguagem natural.</h2>
        <p style="font-size:16px; line-height:1.65; color:var(--text-muted); margin:0;">
          A IA atua como um agrônomo digital acessível 24/7 via WhatsApp, respondendo perguntas, emitindo relatórios e disparando alertas críticos sem necessidade de aplicativos ou treinamento técnico.
        </p>
        
        <div style="margin-top:24px; display:inline-flex; align-items:center; gap:8px; padding:6px 14px; border-radius:999px; background:rgba(34,197,94,0.06); border:1px solid rgba(34,197,94,0.15); font-size:13.5px; font-weight:600; color:var(--brand-green);">
          Agrônomo Digital via WhatsApp
        </div>
      </div>
      
      <div style="display:grid; grid-template-rows:repeat(3,auto); gap:16px;">
        <!-- Feature 1 -->
        <div class="plf-card-hover" style="padding:22px; border-radius:20px; background:var(--surface-glass); -webkit-backdrop-filter:blur(14px); backdrop-filter:blur(14px); border:1px solid var(--border-glass); box-shadow:var(--shadow-soft); display:flex; gap:16px;">
          <span style="flex:none; display:inline-flex; align-items:center; justify-content:center; width:42px; height:42px; border-radius:12px; background:rgba(34,197,94,0.08); color:var(--brand-green);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          </span>
          <div>
            <h4 style="font-family:'Sora',sans-serif; font-weight:700; font-size:15px; margin:0 0 4px; color:var(--text-base);">Diagnóstico Instantâneo por Voz ou Texto</h4>
            <p style="font-size:13px; line-height:1.5; color:var(--text-muted); margin:0;">O produtor pergunta: "Como está meu cultivo?" ou "Quanto de água economizei essa semana?" e recebe o diagnóstico completo com métricas em segundos.</p>
          </div>
        </div>
        
        <!-- Feature 2 -->
        <div class="plf-card-hover" style="padding:22px; border-radius:20px; background:var(--surface-glass); -webkit-backdrop-filter:blur(14px); backdrop-filter:blur(14px); border:1px solid var(--border-glass); box-shadow:var(--shadow-soft); display:flex; gap:16px;">
          <span style="flex:none; display:inline-flex; align-items:center; justify-content:center; width:42px; height:42px; border-radius:12px; background:rgba(34,197,94,0.08); color:var(--brand-green);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </span>
          <div>
            <h4 style="font-family:'Sora',sans-serif; font-weight:700; font-size:15px; margin:0 0 4px; color:var(--text-base);">Relatórios Automáticos em PDF</h4>
            <p style="font-size:13px; line-height:1.5; color:var(--text-muted); margin:0;">Emissão automática de documentações e relatórios de métricas consolidadas diretamente no chat, sem necessidade de acessar painéis complexos.</p>
          </div>
        </div>
        
        <!-- Feature 3 -->
        <div class="plf-card-hover" style="padding:22px; border-radius:20px; background:var(--surface-glass); -webkit-backdrop-filter:blur(14px); backdrop-filter:blur(14px); border:1px solid var(--border-glass); box-shadow:var(--shadow-soft); display:flex; gap:16px;">
          <span style="flex:none; display:inline-flex; align-items:center; justify-content:center; width:42px; height:42px; border-radius:12px; background:rgba(34,197,94,0.08); color:var(--brand-green);">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          </span>
          <div>
            <h4 style="font-family:'Sora',sans-serif; font-weight:700; font-size:15px; margin:0 0 4px; color:var(--text-base);">Alertas Críticos Ativos</h4>
            <p style="font-size:13px; line-height:1.5; color:var(--text-muted); margin:0;">Notificações imediatas ao smartphone do produtor sobre anomalias fitossanitárias detectadas por sensores ou quedas abruptas de energia/temperatura.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- MATRIZ DE COMPARAÇÃO DE MERCADO -->
  <section id="comparacao" style="position:relative; z-index:1; max-width:1180px; margin:0 auto; padding:64px 24px 40px;">
    <div style="text-align:center; max-width:720px; margin:0 auto 44px;">
      <div style="font-size:13px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:var(--brand-green);">MATRIZ DE COMPETITIVIDADE</div>
      <h2 style="font-family:'Sora',sans-serif; font-weight:700; font-size:clamp(28px,3.4vw,40px); line-height:1.15; letter-spacing:-0.01em; margin:14px 0 12px;">Mais inteligente, mais acessível, mais resiliente.</h2>
    </div>

    <div style="background:var(--surface-glass); -webkit-backdrop-filter:blur(16px); backdrop-filter:blur(16px); border:1px solid var(--border-glass); border-radius:24px; padding:24px; overflow-x:auto; box-shadow:var(--shadow-soft);">
      <table style="width:100%; border-collapse:collapse; text-align:left; min-width:800px;">
        <thead>
          <tr style="border-bottom:1px solid rgba(255,255,255,0.08);">
            <th style="padding:16px; font-family:'Sora',sans-serif; font-size:14px; font-weight:600; color:var(--text-faint); width:30%;">Recurso / Critério</th>
            <th style="padding:16px; font-family:'Sora',sans-serif; font-size:15px; font-weight:700; color:var(--brand-green); background:rgba(34,197,94,0.08); border-left:1px solid rgba(34,197,94,0.2); border-right:1px solid rgba(34,197,94,0.2); text-align:center;">PlantiumAI</th>
            <th style="padding:16px; font-family:'Sora',sans-serif; font-size:14px; font-weight:600; color:var(--text-muted); text-align:center;">Sistemas Industriais (Agrosmart)</th>
            <th style="padding:16px; font-family:'Sora',sans-serif; font-size:14px; font-weight:600; color:var(--text-muted); text-align:center;">Automações Simples (Acadêmico)</th>
            <th style="padding:16px; font-family:'Sora',sans-serif; font-size:14px; font-weight:600; color:var(--text-muted); text-align:center;">Estufas de Prateleira (Pink Farms)</th>
          </tr>
        </thead>
        <tbody>
          <!-- Linha 1 -->
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05); transition:background-color .2s;">
            <td style="padding:18px 16px; font-size:14px; font-weight:600; color:var(--text-base);">Custo CapEx (Implantação)</td>
            <td style="padding:18px 16px; text-align:center; background:rgba(34,197,94,0.04); border-left:1px solid rgba(34,197,94,0.15); border-right:1px solid rgba(34,197,94,0.15); font-weight:600; color:var(--brand-green);">
              Muito Baixo (R$ 1.010,08)
            </td>
            <td style="padding:18px 16px; text-align:center; color:var(--text-faint); font-size:13.5px;">
              Altíssimo (> R$ 15k)
            </td>
            <td style="padding:18px 16px; text-align:center; color:var(--text-faint); font-size:13.5px;">
              Baixo (~ R$ 300)
            </td>
            <td style="padding:18px 16px; text-align:center; color:var(--text-faint); font-size:13.5px;">
              Elevado (Engessado)
            </td>
          </tr>
          <!-- Linha 2 -->
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05); transition:background-color .2s;">
            <td style="padding:18px 16px; font-size:14px; font-weight:600; color:var(--text-base);">Coleta de Dados</td>
            <td style="padding:18px 16px; text-align:center; background:rgba(34,197,94,0.04); border-left:1px solid rgba(34,197,94,0.15); border-right:1px solid rgba(34,197,94,0.15); font-weight:600; color:var(--brand-green);">
              Completa (Ar, Solo, Luz e CO₂)
            </td>
            <td style="padding:18px 16px; text-align:center; color:var(--text-faint); font-size:13.5px;">
              Apenas Solo / Clima
            </td>
            <td style="padding:18px 16px; text-align:center; color:var(--text-faint); font-size:13.5px;">
              Apenas Solo Estático
            </td>
            <td style="padding:18px 16px; text-align:center; color:var(--text-faint); font-size:13.5px;">
              Proprietário Fechado
            </td>
          </tr>
          <!-- Linha 3 -->
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05); transition:background-color .2s;">
            <td style="padding:18px 16px; font-size:14px; font-weight:600; color:var(--text-base);">Autonomia sem Internet</td>
            <td style="padding:18px 16px; text-align:center; background:rgba(34,197,94,0.04); border-left:1px solid rgba(34,197,94,0.15); border-right:1px solid rgba(34,197,94,0.15); font-weight:600; color:var(--brand-green);">
              Sim (Fail-Safe Local)
            </td>
            <td style="padding:18px 16px; text-align:center; color:var(--text-faint); font-size:13.5px;">
              Não (Refém da Nuvem)
            </td>
            <td style="padding:18px 16px; text-align:center; color:var(--text-faint); font-size:13.5px;">
              Sim (Sem IA)
            </td>
            <td style="padding:18px 16px; text-align:center; color:var(--text-faint); font-size:13.5px;">
              Parcial
            </td>
          </tr>
          <!-- Linha 4 -->
          <tr style="border-bottom:1px solid rgba(255,255,255,0.05); transition:background-color .2s;">
            <td style="padding:18px 16px; font-size:14px; font-weight:600; color:var(--text-base);">Interface Conversacional</td>
            <td style="padding:18px 16px; text-align:center; background:rgba(34,197,94,0.04); border-left:1px solid rgba(34,197,94,0.15); border-right:1px solid rgba(34,197,94,0.15); font-weight:600; color:var(--brand-green);">
              Sim (WhatsApp / IA)
            </td>
            <td style="padding:18px 16px; text-align:center; color:var(--text-faint); font-size:13.5px;">
              Não (Gráficos Complexos)
            </td>
            <td style="padding:18px 16px; text-align:center; color:var(--text-faint); font-size:13.5px;">
              Não
            </td>
            <td style="padding:18px 16px; text-align:center; color:var(--text-faint); font-size:13.5px;">
              Não
            </td>
          </tr>
          <!-- Linha 5 -->
          <tr style="transition:background-color .2s;">
            <td style="padding:18px 16px; font-size:14px; font-weight:600; color:var(--text-base);">Emulador de Biomas</td>
            <td style="padding:18px 16px; text-align:center; background:rgba(34,197,94,0.04); border-left:1px solid rgba(34,197,94,0.15); border-right:1px solid rgba(34,197,94,0.15); border-bottom:1px solid rgba(34,197,94,0.15); font-weight:600; color:var(--brand-green);">
              Sim (Modula Luz / Água)
            </td>
            <td style="padding:18px 16px; text-align:center; color:var(--text-faint); font-size:13.5px;">
              Não
            </td>
            <td style="padding:18px 16px; text-align:center; color:var(--text-faint); font-size:13.5px;">
              Não
            </td>
            <td style="padding:18px 16px; text-align:center; color:var(--text-faint); font-size:13.5px;">
              Não
            </td>
          </tr>
        </tbody>
      </table>
      
      <div style="margin-top:20px; font-size:14px; color:var(--text-muted); text-align:center; font-weight:500;">
        "O PlantiumAI é o único sistema que combina baixo custo, autonomia offline, interface acessível e emulação de biomas."
      </div>
    </div>
  </section>

  <!-- MODELO DE NEGÓCIO -->
  <section id="mercado" style="position:relative; z-index:1; max-width:1180px; margin:0 auto; padding:64px 24px 40px;">
    <div style="text-align:center; max-width:760px; margin:0 auto 44px;">
      <div style="font-size:13px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:var(--brand-green);">MODELO DE NEGÓCIO TRIPARTITE</div>
      <h2 style="font-family:'Sora',sans-serif; font-weight:700; font-size:clamp(28px,3.4vw,40px); line-height:1.15; letter-spacing:-0.01em; margin:14px 0 12px;">Estratégia Freemium (Isca e Anzol) focada em escala e tração.</h2>
    </div>
    
    <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:24px;" class="plf-pillars">
      <!-- Coluna Freemium -->
      <div class="plf-card-hover" style="padding:32px; border-radius:28px; background:var(--surface-glass); -webkit-backdrop-filter:blur(16px); backdrop-filter:blur(16px); border:1px solid var(--border-glass); box-shadow:var(--shadow-soft); display:flex; flex-direction:column; min-height:400px; justify-content:between; height:100%;">
        <div>
          <div style="font-size:12px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:var(--brand-green);">FREEMIUM · A ISCA</div>
          <h3 style="font-family:'Sora',sans-serif; font-weight:700; font-size:24px; margin:14px 0 8px; color:var(--text-base);">WhatsApp Grátis</h3>
          <p style="font-size:14px; line-height:1.6; color:var(--text-muted); margin:0 0 20px;">
            Uso de IA totalmente gratuito no WhatsApp. O cliente envia foto da planta e a IA identifica doenças instantaneamente. Foco em máxima penetração de mercado sem barreiras de entrada.
          </p>
        </div>
        <div style="margin-top:auto;">
          <div style="font-family:'Sora',sans-serif; font-weight:700; font-size:24px; color:var(--text-base); margin-bottom:16px;">R$ 0<span style="font-size:14px; color:var(--text-muted);">/mês</span></div>
          <div style="font-size:12px; color:var(--text-faint); margin-bottom:16px;">Monetização: Comissão via parceiros de defensivos convencionais ou biológicos.</div>
          <a href="/login" class="plf-btn-ghost" style="display:block; text-align:center; padding:12px 24px; border-radius:999px; border:1px solid var(--border-glass); background:var(--surface-raised); color:var(--text-base); font-size:14px; font-weight:600; text-decoration:none;">Começar Agora</a>
        </div>
      </div>
      
      <!-- Coluna Premium -->
      <div class="plf-card-hover" style="padding:32px; border-radius:28px; background:var(--surface-glass); -webkit-backdrop-filter:blur(16px); backdrop-filter:blur(16px); border:2px solid var(--brand-green); box-shadow:0 8px 32px rgba(52,217,119,0.1); display:flex; flex-direction:column; min-height:400px; justify-content:between; position:relative; height:100%;">
        <span style="position:absolute; top:-12px; right:20px; background:var(--brand-green); color:#06120b; font-size:11px; font-weight:700; padding:4px 10px; border-radius:999px; text-transform:uppercase; letter-spacing:0.04em;">Recomendado</span>
        <div>
          <div style="font-size:12px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:var(--brand-green);">PREMIUM · O ANZOL</div>
          <h3 style="font-family:'Sora',sans-serif; font-weight:700; font-size:24px; margin:14px 0 8px; color:var(--text-base);">Software Assinatura</h3>
          <p style="font-size:14px; line-height:1.6; color:var(--text-muted); margin:0 0 20px;">
            Aluguel mensal acessível do software integrado. Inclui a locação completa das placas ESP32 e sensores. Instalação e configuração em campo inclusas.
          </p>
        </div>
        <div style="margin-top:auto;">
          <div style="font-family:'Sora',sans-serif; font-weight:700; font-size:24px; color:var(--brand-green); margin-bottom:16px;">Assinatura Recorrente</div>
          <div style="font-size:12px; color:var(--text-faint); margin-bottom:16px;">Monetização: Receita recorrente (MRR) com baixo churn por dependência operacional.</div>
          <a href="/login" class="plf-btn-primary" style="display:block; text-align:center; padding:12px 24px; border-radius:999px; background:var(--brand-green); color:#06120b; font-size:14px; font-weight:600; text-decoration:none; box-shadow:0 4px 14px rgba(52,217,119,0.3);">Assinar Premium</a>
        </div>
      </div>
      
      <!-- Coluna Pro -->
      <div class="plf-card-hover" style="padding:32px; border-radius:28px; background:var(--surface-glass); -webkit-backdrop-filter:blur(16px); backdrop-filter:blur(16px); border:1px solid var(--border-glass); box-shadow:var(--shadow-soft); display:flex; flex-direction:column; min-height:400px; justify-content:between; height:100%;">
        <div>
          <div style="font-size:12px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:var(--brand-green);">PRO · A ESCALA</div>
          <h3 style="font-family:'Sora',sans-serif; font-weight:700; font-size:24px; margin:14px 0 8px; color:var(--text-base);">Aquisição Total</h3>
          <p style="font-size:14px; line-height:1.6; color:var(--text-muted); margin:0 0 20px;">
            Venda direta do hardware proprietário por um valor único. Assinatura enxuta do software de gestão. 1 ano de manutenção e suporte totalmente gratuitos.
          </p>
        </div>
        <div style="margin-top:auto;">
          <div style="font-family:'Sora',sans-serif; font-weight:700; font-size:24px; color:var(--text-base); margin-bottom:16px;">Venda Direta + SaaS</div>
          <div style="font-size:12px; color:var(--text-faint); margin-bottom:16px;">Monetização: Alto ticket médio (CapEx) + assinatura (SaaS).</div>
          <a href="/login" class="plf-btn-ghost" style="display:block; text-align:center; padding:12px 24px; border-radius:999px; border:1px solid var(--border-glass); background:var(--surface-raised); color:var(--text-base); font-size:14px; font-weight:600; text-decoration:none;">Adquirir Kit</a>
        </div>
      </div>
    </div>
  </section>

  <!-- EQUIPE -->
  <section id="equipe" style="position:relative; z-index:1; max-width:1180px; margin:0 auto; padding:64px 24px 40px;">
    <div style="text-align:center; max-width:760px; margin:0 auto 44px;">
      <div style="font-size:13px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:var(--brand-green);">EQUIPE PLANTIUMAI</div>
      <h2 style="font-family:'Sora',sans-serif; font-weight:700; font-size:clamp(28px,3.4vw,40px); line-height:1.15; letter-spacing:-0.01em; margin:14px 0 0;">Quem constrói o equilíbrio entre a biocenose e a IA.</h2>
    </div>
    <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:22px;" class="plf-team">
      ${[
        { photo: "/landing/thyago.jpeg", name: "Thyago Henrique Toledo de Assis", role: "Owner Full-Stack & Financeiro", badge: "SOFTWARE", bio: "Lidera o ecossistema de software (Rust/Tauri 2) e o repositório oficial; conduz custos, análise econômica e viabilidade do piloto." },
        { photo: "/landing/joao.jpeg", name: "João Felipe Antunes Ribeiro", role: "Owner Hardware & Negócio", badge: "HARDWARE", bio: "Planeja, valida e especifica componentes físicos, sensores e atuadores; articula inserção comercial e modelagem de mercado." },
        { photo: "/landing/gabriel.jpeg", name: "Gabriel Augusto de Sousa", role: "Owner Arquitetura ESP32/IoT", badge: "FIRMWARE", bio: "Desenha a arquitetura IoT distribuída e o firmware dos nós ESP32; ponte de cooperação tecnológica com a SiriNEO Technologies." },
        { photo: "/landing/marco.jpeg", name: "Marco Antônio Moreira de Freitas", role: "CEO & Agrônomo", badge: "AGRONOMIA", bio: "Lidera a visão estratégica e a validação agronômica (faixas ideais, limiares de estresse), alinhando o sistema às dores mapeadas." },
      ]
        .map(
          (m) => `<div class="plf-team-card" style="border-radius:24px; overflow:hidden; background:var(--surface-glass); -webkit-backdrop-filter:blur(16px); backdrop-filter:blur(16px); border:1px solid var(--border-glass); box-shadow:var(--shadow-soft);">
          <div style="position:relative; aspect-ratio:4/5; overflow:hidden;">
            <img src="${m.photo}" alt="${m.name}" style="width:100%; height:100%; object-fit:cover; object-position:center 18%;"/>
            <div style="position:absolute; inset:0; background:linear-gradient(180deg,transparent 55%,rgba(6,18,11,0.78) 100%);"></div>
            <span style="position:absolute; left:14px; bottom:12px; display:inline-flex; align-items:center; gap:6px; padding:5px 11px; border-radius:999px; background:rgba(52,217,119,0.92); color:#06120b; font-size:11.5px; font-weight:700;">${m.badge}</span>
          </div>
          <div style="padding:18px 18px 22px;">
            <div style="font-family:'Sora',sans-serif; font-weight:600; font-size:16.5px; line-height:1.25;">${m.name}</div>
            <div style="font-size:13px; font-weight:600; color:var(--brand-green); margin-top:6px;">${m.role}</div>
            <p style="font-size:13px; line-height:1.5; color:var(--text-muted); margin:10px 0 0;">${m.bio}</p>
          </div>
        </div>`,
        )
        .join("")}
    </div>
    <p style="text-align:center; font-size:13px; color:var(--text-faint); margin:30px auto 0; max-width:720px;">Crédito acadêmico — Trabalho Científico, Engenharia de Software, Faculdade SENAI FATESG, Goiânia/GO, 2026. Orientador: Prof. Renato Ribeiro dos Santos.</p>
  </section>

  <!-- PARCEIROS -->
  <section id="parceiros" style="position:relative; z-index:1; max-width:1180px; margin:0 auto; padding:48px 24px 40px;">
    <div style="text-align:center; max-width:760px; margin:0 auto 44px;">
      <div style="font-size:13px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:var(--brand-green);">PARCEIROS E IMPACTO</div>
      <h2 style="font-family:'Sora',sans-serif; font-weight:700; font-size:clamp(28px,3.4vw,40px); line-height:1.15; letter-spacing:-0.01em; margin:14px 0 0;">Validado no ecossistema de Goiás. Pronto para escalar.</h2>
    </div>

    <!-- Integrantes Parceiros -->
    <div style="font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-faint); margin-bottom:24px; text-align:center;">Membros & Cargos</div>
    <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:22px; margin-bottom:56px;" class="plf-team">
      ${[
        { photo: "/landing/cirineu.jpg", name: "Cirineu C. Fernandes", role: "CEO · SiriNEO Technologies", badge: "Mestrando ITA", bio: "Engenheiro Mecatrônico, Especialista em Telecomunicações e Segurança Pública, Mestrando no PPGAO pelo ITA no Departamento de Guerra Eletrônica e Sensoriamento Remoto, em domínios críticos de defesa, com pesquisa em Sistemas Embarcados para o setor aeroespacial." },
        { photo: "/landing/juliana.jpg", name: "Juliana C. V. Fernandes", role: "Co-fundadora · SiriNEO Technologies", badge: "Gestão de Recursos", bio: "Fisioterapeuta e Administradora. Apoia o desenvolvimento de sistemas distribuídos e arquitetura de instrumentação eletrônica para micro estufas." },
        { photo: "/landing/renato.png", name: "Prof. Renato Ribeiro dos Santos", role: "Orientador · Diretor FPM & Fundador VarejoIN", badge: "FPM / VarejoIN", bio: "Diretor da Faculdade de Principios Militares (FPM) e fundador da empresa VarejoIN. Orientador cientifico do projeto PlantiumAI." }
      ]
        .map(
          (m) => `<div class="plf-team-card" style="border-radius:24px; overflow:hidden; background:var(--surface-glass); -webkit-backdrop-filter:blur(16px); backdrop-filter:blur(16px); border:1px solid var(--border-glass); box-shadow:var(--shadow-soft);">
          <div style="position:relative; aspect-ratio:4/5; overflow:hidden;">
            <img src="${m.photo}" alt="${m.name}" style="width:100%; height:100%; object-fit:cover; object-position:center 18%;"/>
            <div style="position:absolute; inset:0; background:linear-gradient(180deg,transparent 55%,rgba(6,18,11,0.78) 100%);"></div>
            <span style="position:absolute; left:14px; bottom:12px; display:inline-flex; align-items:center; gap:6px; padding:5px 11px; border-radius:999px; background:rgba(52,217,119,0.92); color:#06120b; font-size:11.5px; font-weight:700;">${m.badge}</span>
          </div>
          <div style="padding:18px 18px 22px;">
            <div style="font-family:'Sora',sans-serif; font-weight:600; font-size:16.5px; line-height:1.25;">${m.name}</div>
            <div style="font-size:13px; font-weight:600; color:var(--brand-green); margin-top:6px;">${m.role}</div>
            <p style="font-size:13px; line-height:1.5; color:var(--text-muted); margin:10px 0 0;">${m.bio}</p>
          </div>
        </div>`,
        )
        .join("")}
    </div>

    <!-- Empresas e Instituições Parceiras -->
    <div style="font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-faint); margin-bottom:28px; text-align:center;">Parceiros de Negócios</div>
    <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:32px; align-items:center;" class="plf-pillars">
      ${[
        { logo: "/landing/logo-sirineo.png", name: "SiriNEO Technologies", desc: "Apoio na fabricação e escala industrial do hardware IoT.", link: "https://sirineotechnologies.com/" },
        { logo: "/landing/logo-fpm.png", name: "Faculdade de Princípios Militares (FPM)", desc: "Validação científica e inserção institucional." },
        { logo: "/landing/logo-varejoin.png", name: "VarejoIN", desc: "Estratégia comercial e canais de distribuição." }
      ]
        .map(
          (c) => {
            const cardContent = `<div style="padding:28px; border-radius:24px; background:var(--surface-solid); border:1px solid var(--border-glass); box-shadow:var(--shadow-soft); text-align:center; display:flex; flex-direction:column; align-items:center; gap:16px; height:100%;">
            <div style="width:72px; height:72px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:rgba(255,255,255,0.02); overflow:hidden;">
              <img src="${c.logo}" alt="${c.name}" style="max-width:100%; max-height:100%; object-fit:contain;"/>
            </div>
            <div>
              <div style="font-family:'Sora',sans-serif; font-weight:700; font-size:15px; color:var(--text-base);">${c.name}</div>
              <p style="font-size:13px; line-height:1.55; color:var(--text-muted); margin:8px 0 0;">${c.desc}</p>
            </div>
          </div>`;
            return c.link
              ? `<a href="${c.link}" target="_blank" rel="noopener noreferrer" style="display:block; text-decoration:none; color:inherit; height:100%;" class="plf-card-hover">${cardContent}</a>`
              : `<div style="height:100%;">${cardContent}</div>`;
          }
        )
        .join("")}
    </div>
  </section>

  <!-- CTA FINAL -->
  <section id="contato" style="position:relative; z-index:1; max-width:1180px; margin:0 auto; padding:40px 24px 72px;">
    <div style="padding:56px 40px; border-radius:28px; text-align:center; background:linear-gradient(135deg,var(--brand-green),var(--brand-green-deep)); box-shadow:0 24px 56px rgba(22,163,74,0.4); position:relative; overflow:hidden;">
      <div style="position:absolute; top:-80px; left:-40px; width:240px; height:240px; border-radius:50%; background:radial-gradient(circle,rgba(255,255,255,0.18),transparent 70%);"></div>
      <div style="position:absolute; bottom:-100px; right:-40px; width:280px; height:280px; border-radius:50%; background:radial-gradient(circle,rgba(255,255,255,0.12),transparent 70%);"></div>
      <h2 style="position:relative; font-family:'Sora',sans-serif; font-weight:800; font-size:clamp(24px,3.2vw,36px); line-height:1.2; letter-spacing:-0.01em; color:#06120b; margin:0; text-transform:uppercase;">MAIS PRODUTIVIDADE, MENOS DESPERDÍCIO.</h2>
      <p style="position:relative; font-family:'Sora',sans-serif; font-weight:800; font-size:clamp(20px,2.6vw,30px); line-height:1.2; color:#06120b; max-width:640px; margin:12px auto 0; text-transform:uppercase;">O FUTURO DO AGRO CHEGOU!</p>
      <div style="position:relative; display:flex; gap:14px; justify-content:center; margin-top:32px; flex-wrap:wrap;">
        <a href="/planos" style="padding:14px 30px; border-radius:999px; border:none; background:#06120b; color:#fff; font-family:'Inter',sans-serif; font-size:15px; font-weight:600; cursor:pointer; box-shadow:0 8px 20px rgba(0,0,0,0.25); transition:transform .15s;">Planos</a>
        <a href="https://github.com/PlantiumAI/PlantiumAI" target="_blank" rel="noopener" class="plf-cta-git" style="display:inline-flex; align-items:center; gap:8px; padding:14px 30px; border-radius:999px; background:#181717; border:none; color:#ffffff; font-size:15px; font-weight:600; cursor:pointer; box-shadow:0 8px 20px rgba(0,0,0,0.15); transition:transform .15s;"><svg width="17" height="17" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38v-1.34c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.05-.49.05-.49.8.06 1.23.83 1.23.83.71 1.23 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.83-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.52.56.83 1.28.83 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.19c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>Ver no GitHub</a>
        <a href="https://www.youtube.com/@PlantiumAI" target="_blank" rel="noopener" class="plf-cta-yt" style="display:inline-flex; align-items:center; gap:8px; padding:14px 30px; border-radius:999px; background:#FF0000; border:none; color:#ffffff; font-size:15px; font-weight:600; cursor:pointer; box-shadow:0 8px 20px rgba(255,0,0,0.25); transition:transform .15s;"><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.11-2.12C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.39.58A3 3 0 0 0 .5 6.2 31.2 31.2 0 0 0 0 12a31.2 31.2 0 0 0 .5 5.8 3 3 0 0 0 2.11 2.12C4.5 20.5 12 20.5 12 20.5s7.5 0 9.39-.58A3 3 0 0 0 23.5 17.8 31.2 31.2 0 0 0 24 12a31.2 31.2 0 0 0-.5-5.8zM9.55 15.57V8.43L15.82 12l-6.27 3.57z"/></svg>Inscreva-se no canal</a>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer style="position:relative; z-index:1; border-top:1px solid var(--border-subtle); margin-top:8px;" class="plf-footer-wrap">
    <div style="max-width:1180px; margin:0 auto; padding:40px 24px 24px; display:grid; grid-template-columns:1.4fr 1fr 1fr; gap:32px; align-items:start;" class="plf-footer">
      <div>
        <div style="display:flex; align-items:center; gap:11px; font-family:'Sora',sans-serif; font-weight:700; font-size:17px;">
          <img src="/logo-plantiumai.png" alt="Logo PlantiumAI" width="36" height="36" style="display:block; width:36px; height:36px; border-radius:50%; object-fit:cover;"/>
          PlantiumAI
        </div>
        <p style="font-size:13.5px; line-height:1.55; color:var(--text-muted); margin:14px 0 0; max-width:340px;">Funcionalidades de nuvem, painel web, app móvel e visão computacional fazem parte da evolução planejada.</p>
      </div>
      <div>
        <div style="font-size:12px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:var(--text-faint); margin-bottom:12px;">Navegação</div>
        <div style="display:flex; flex-direction:column; gap:9px; font-size:14px; color:var(--text-muted);">
          <a href="#solucao">O Problema</a>
          <a href="#tecnologia">A Solução</a>
          <a href="#interface-conversacional">Interface Conversacional</a>
          <a href="#comparacao">Matriz de Competitividade</a>
          <a href="#mercado">Modelo de Negócio</a>
          <a href="#equipe">Equipe</a>
          <a href="#parceiros">Parceiros</a>
        </div>
      </div>
      <div>
        <div style="font-size:12px; font-weight:600; letter-spacing:0.06em; text-transform:uppercase; color:var(--text-faint); margin-bottom:12px;">Canais oficiais</div>
        <div style="display:flex; flex-direction:column; gap:9px; font-size:14px; color:var(--text-muted);">
          <a href="mailto:plantiumai@gmail.com" style="display:flex; align-items:center; gap:8px;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg>plantiumai@gmail.com</a>
          <a href="https://www.instagram.com/plantiumai" target="_blank" rel="noopener" style="display:flex; align-items:center; gap:8px;"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>@plantiumai</a>
          <a href="https://youtube.com/@PlantiumAI" target="_blank" rel="noopener" style="display:flex; align-items:center; gap:8px;"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M23 7.5a3 3 0 0 0-2.1-2.1C19 5 12 5 12 5s-7 0-8.9.4A3 3 0 0 0 1 7.5 31 31 0 0 0 .6 12 31 31 0 0 0 1 16.5a3 3 0 0 0 2.1 2.1C5 19 12 19 12 19s7 0 8.9-.4a3 3 0 0 0 2.1-2.1A31 31 0 0 0 23.4 12 31 31 0 0 0 23 7.5zM9.8 15.3V8.7l5.7 3.3z"/></svg>@PlantiumAI</a>
          <a href="https://github.com/PlantiumAI/PlantiumAI" target="_blank" rel="noopener" style="display:flex; align-items:center; gap:8px;"><svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38v-1.34c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.05-.49.05-.49.8.06 1.23.83 1.23.83.71 1.23 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.83-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.52.56.83 1.28.83 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.19c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>PlantiumAI/PlantiumAI</a>
        </div>
      </div>
    </div>
    <div style="max-width:1180px; margin:0 auto; padding:18px 24px 0; border-top:1px solid var(--border-subtle); font-size:13px; color:var(--text-faint); display:flex; justify-content:space-between; gap:16px; flex-wrap:wrap;">
      <span>© 2026 PlantiumAI · Micro estufas e hortas verticais inteligentes</span>
      <span style="display:inline-flex; align-items:center; gap:6px;">
        <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--brand-green);"></span>
        Acelerado pelo Desafio AgroStartup 2026 (10 Anos)
      </span>
    </div>
  </footer>

</div>
`;

export function Landing() {
  useEffect(() => {
    // ---- Menu mobile: fechar ao clicar num link (enhancement do checkbox) ----
    const navToggle = document.getElementById(
      "plf-nav-toggle",
    ) as HTMLInputElement | null;
    const menu = document.getElementById("plf-mobile-menu");
    const closeMenu = () => {
      if (navToggle) navToggle.checked = false;
    };
    menu?.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", closeMenu),
    );

    // ---- Scroll reveal (animações que valorizam a marca) ----
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let io: IntersectionObserver | null = null;
    if (!prefersReduced && "IntersectionObserver" in window) {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("plf-in");
              io?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
      );
      // Já visível na viewport? Revela no MESMO tick (sem flash visível→some).
      const inView = (el: HTMLElement) => {
        const r = el.getBoundingClientRect();
        return r.top < window.innerHeight * 0.9 && r.bottom > 0;
      };
      // Grids de cards: classe aplicada via JS (sem JS, conteúdo permanece
      // visível). Filhos animam em cascata via CSS nth-child.
      document
        .querySelectorAll<HTMLElement>(
          ".plf-root .plf-flow, .plf-root .plf-pillars, .plf-root .plf-team",
        )
        .forEach((g) => {
          g.classList.add("plf-stagger");
          if (inView(g)) g.classList.add("plf-in");
          else io?.observe(g);
        });
      // Blocos principais sobem com fade; cascata entre irmãos do mesmo grupo.
      const blocks = document.querySelectorAll<HTMLElement>(
        ".plf-root section > div:not(#plf-video-section):not(.plf-stagger), .plf-root #solucao, .plf-root .plf-preview, .plf-root .plf-footer > div",
      );
      blocks.forEach((el) => {
        el.classList.add("plf-reveal");
        const sibs = Array.from(el.parentElement?.children ?? []).filter((c) =>
          c.classList.contains("plf-reveal"),
        );
        const i = sibs.indexOf(el);
        el.style.transitionDelay = `${Math.min(i, 5) * 80}ms`;
        if (inView(el)) el.classList.add("plf-in");
        else io?.observe(el);
      });
    }

    // GSAP ScrollTrigger video scrub
    gsap.registerPlugin(ScrollTrigger);

    const section = document.getElementById("plf-video-section");
    const video = document.getElementById("plf-video-scrub") as HTMLVideoElement | null;
    const progressBar = document.getElementById("plf-video-progress") as HTMLElement | null;
    const scrollHint = document.getElementById("plf-scroll-hint") as HTMLElement | null;
    // Mobile/touch travam no "seek" rápido do currentTime (iOS bloqueia seeks
    // durante o scroll). Nesses casos — e com prefers-reduced-motion — caímos
    // para autoplay em loop (sem scroll-jacking), garantindo responsividade.
    const lowPower = window.matchMedia(
      "(prefers-reduced-motion: reduce), (max-width: 760px), (pointer: coarse)",
    ).matches;
    let st: ReturnType<typeof ScrollTrigger.create> | null = null;
    let initialized = false;

    const initScrub = () => {
      if (initialized) return;
      initialized = true;
      st = ScrollTrigger.create({
        // Pin do PRÓPRIO bloco do vídeo (position:fixed) — não usar CSS sticky.
        trigger: "#plf-video-sticky",
        start: "top top",
        end: "+=250%", // distância de scroll p/ percorrer o vídeo (~2,5 telas)
        pin: true,
        pinSpacing: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          if (video && Number.isFinite(video.duration) && video.duration > 0) {
            video.currentTime = video.duration * self.progress;
          }
          if (progressBar) progressBar.style.width = `${self.progress * 100}%`;
          if (scrollHint) scrollHint.style.opacity = self.progress > 0.05 ? "0" : "1";
        },
      });
      // Recalcula medidas após o layout assentar (evita gaps/posições erradas).
      ScrollTrigger.refresh();
    };

    if (video) {
      if (lowPower) {
        // Acessibilidade: sem scroll-jacking — vídeo vira loop suave em altura normal.
        section?.classList.add("plf-reduced");
        video.loop = true;
        video.play().catch(() => {});
      } else {
        if (video.readyState >= 1 && Number.isFinite(video.duration)) {
          initScrub();
        } else {
          video.addEventListener("loadedmetadata", initScrub, { once: true });
          video.addEventListener("canplay", initScrub, { once: true });
          // Fallback de segurança: inicializa de qualquer forma após 1 segundo
          const t = setTimeout(initScrub, 1000);
          
          // Note: clear timeout on unmount is handled in cleanup function below
        }
      }
    }

    // Recalcula quando tudo (imagens/fontes) terminar de carregar.
    const onLoad = () => ScrollTrigger.refresh();
    if (!lowPower) window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      if (video) {
        video.removeEventListener("loadedmetadata", initScrub);
        video.removeEventListener("canplay", initScrub);
      }
      menu?.querySelectorAll("a").forEach((a) =>
        a.removeEventListener("click", closeMenu),
      );
      io?.disconnect();
      st?.kill();
    };
  }, []);

  return (
    <div className="plf-root" style={{ scrollBehavior: "smooth" }} dangerouslySetInnerHTML={{ __html: HTML }} />
  );
}
