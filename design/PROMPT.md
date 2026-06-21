# Prompt pronto — gerar a landing page da PlantiumAI

> Envie este texto **junto com** a imagem de referência (AgricAI) e o arquivo
> `plantium-design-system.md`. Cole o prompt e anexe os dois.

---

## Prompt (copie a partir daqui)

Você é um designer/engenheiro front-end sênior. Anexei dois materiais:

1. **Uma imagem de referência** (dashboard "AgricAI") — use-a apenas como direção
   de **estética e atmosfera**: tema claro, glassmorphism (vidro fosco), verde-folha,
   cards arredondados, fotos de natureza, sombras suaves, números grandes.
2. **O arquivo `plantium-design-system.md`** — esta é a **fonte de verdade** de
   tokens, tipografia, componentes, temas e regras. Siga-o à risca.

### Projeto
**PlantiumAI — Micro Estufas Inteligentes.** Quero a **landing page institucional**
que apresenta o projeto para **investidores** e curiosos. Não é o app operacional;
é o site de marketing/apresentação.

### O que construir
Uma landing page responsiva (HTML + CSS, ou React + Tailwind — veja "Stack" abaixo) com:

1. **Navbar de vidro** no topo: logo folha + "PlantiumAI", tabs (Visão geral · Tecnologia ·
   Impacto · Time), **toggle de tema claro/escuro** e botão "Entrar".
2. **Hero**: headline de impacto sobre micro estufas inteligentes com IA, subheadline,
   CTA primário ("Quero investir") + secundário ("Saiba mais"), e um mockup/preview do
   dashboard de monitoramento (cards de KPI de vidro: umidade do solo, temperatura,
   CO₂, pH, luminosidade) com um **gauge de Health Score** em verde.
3. **Seção Problema → Solução**: por que micro estufas + IA importam.
4. **Seção Tecnologia**: ESP32 + sensores → app desktop (Tauri) → IA de irrigação.
5. **Seção Métricas/Impacto**: números grandes (estilo "+80% saúde", "economia de água",
   "produção"), formato amigável a investidores.
6. **Seção Time** (cards com avatar).
7. **CTA final** + **Footer**.
8. **Página/Modal de Login** completa, conforme a seção 5 do design system
   (card de vidro, e-mail/senha, lembrar-me, esqueci a senha, login Google, criar conta,
   toggle de tema).

### Regras obrigatórias
- Implemente **os dois temas** (claro = padrão da landing; escuro). Use **CSS variables/tokens**
  exatamente como no design system; troca via `data-theme` no `<html>` + `localStorage`
  (`plantium-theme`) e respeitando `prefers-color-scheme` na 1ª visita.
- **Glassmorphism** real (`backdrop-filter: blur(18px)`, superfícies translúcidas, bordas suaves).
- Verde **`#22c55e`** apenas funcional (CTA, ativo, saúde). Nada de caixa-alta sistemática —
  **sentence case**. Tudo arredondado (≥12px), sombras suaves e difusas.
- Tipografia: **Sora** (display/títulos/números) + **Inter** (corpo). Importe as fontes.
- Acessível: foco visível (anel verde), labels associados, contraste AA, `aria-*` no toggle.
- Responsivo (mobile → desktop) conforme a seção 9.

### Stack
Use **React + Vite + Tailwind CSS** (o projeto já usa essa stack no app desktop), mapeando os
tokens do design system para `tailwind.config` (cores `brand`, `surface`, etc.) e CSS variables
para os dois temas. Componentize: `Navbar`, `Hero`, `KpiCard`, `HealthGauge`, `PeriodToggle`,
`ThemeToggle`, `Section`, `Login`. Entregue código pronto para rodar (`npm run dev`).

### Entregáveis
1. Código completo e organizado por componentes.
2. `tailwind.config` + CSS de tokens dos dois temas.
3. Instruções curtas de como rodar.
4. Breve nota de quais imagens/placeholders usar (natureza/estufa) e onde trocar.

Capriche no acabamento premium — esta página vai para investidores.

---

## Dica de uso

- Se for usar dentro do **Claude Code / Claude Design**, pode pedir: *"gere os componentes
  e renderize um preview da landing no tema claro e no escuro"*.
- Se a ferramenta não aceitar 2 anexos, cole o conteúdo do `plantium-design-system.md`
  inline depois do prompt, antes de anexar a imagem.
