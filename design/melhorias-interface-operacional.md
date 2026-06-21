# Melhorias da Interface Operacional (app desktop Tauri)

> Como evoluir o dashboard operacional (`desktop/`) na direção do novo design system,
> mantendo coerência entre a **landing institucional** e o **app real**.
> Estado atual: tema escuro fixo (`#0d1117` GitHub-like) + verde-folha (`leaf`), Inter,
> cards com borda sólida. Ver [`plantium-design-system.md`](plantium-design-system.md).

---

## 1. Alinhamento de tokens (prioridade alta, baixo esforço)

- Migrar `tailwind.config.js` para os **mesmos tokens do design system** (`brand-green #22c55e`,
  superfícies, semânticas). Hoje o `surface` é azulado (`#0d1117`); o design system usa
  verde quase-preto (`#0b1410`) — unificar para a identidade verde.
- Trocar cores hardcoded por **CSS variables** (`var(--…)`) — pré-requisito para o tema claro.
- Unificar a escala de radius (cards 20px, inputs 12px, pílulas 999px).

## 2. Tema claro + toggle (prioridade alta)

- O app hoje é dark-only (`color-scheme: dark` em `index.css`). Introduzir **tema claro**
  e um **ThemeToggle** (sol/lua) — útil para uso em ambientes iluminados (estufa/campo).
- Persistir em `localStorage` e respeitar `prefers-color-scheme`.

## 3. Glassmorphism e sombras suaves (prioridade média)

- Cards hoje usam `border + bg sólido`. Adotar superfícies de vidro (`backdrop-blur`) e
  **sombras difusas** em vez de bordas duras — o visual fica premium e coerente com a landing.
- Cuidado: `backdrop-filter` tem custo de GPU; usar com moderação em telas com muitos cards.

## 4. Hierarquia visual dos KPIs (prioridade média)

- Os `StatCard` podem ganhar: **ícone em círculo verde-tint**, label em caixa-alta curta com
  tracking, **número grande em Sora 700**, e **chip de status** (`Ideal`/`Atenção`/`Crítico`)
  usando as cores semânticas — exatamente como a referência AgricAI.
- Adicionar **gauge circular de "Health Score"** agregando os sensores (média ponderada),
  dando uma leitura única de saúde da estufa (ótimo para demo a investidores).

## 5. Seletor de período e gráficos (prioridade média)

- Adicionar **toggle segmentado de período** (1h/6h/24h/7d) no histórico — hoje o `LiveChart`
  mostra janela fixa.
- Alinhar a paleta de séries do ECharts à paleta de data viz do design system
  (`#22c55e → #14b8a6 → #84cc16 → #38bdf8 …`).

## 6. Estados e microinterações (prioridade baixa)

- Estados de conexão (`desconectado`/`modo demo`/`conectado`) como **chips coloridos** com bolinha.
- Hover/elevação suave nos cards (`translateY(-2px)` + sombra) e transições de tema (`.3s`).
- Skeletons de carregamento em vez de telas vazias.

## 7. Tipografia

- Adicionar **Sora** para títulos e números (KPIs), mantendo **Inter** no corpo — mesmo par da landing.
- Aumentar respiro/line-height nas telas de configuração (são telas de leitura, não de fluxo denso).

---

## Como prototipar com o Claude (Claude Design / Visualize)

- **Mockups rápidos**: pedir ao Claude para gerar um *widget* HTML/SVG com o novo `StatCard`,
  o `HealthGauge` e o `ThemeToggle` nos dois temas, antes de tocar no código React — valida o
  visual sem custo de build.
- **Design-to-code**: descrever o card com os tokens (ver "Guia para Agentes" no design system)
  e pedir o componente React + Tailwind pronto para colar em `desktop/src/components/`.
- **Comparar temas**: pedir preview lado a lado (claro × escuro) para checar contraste/AA.
- **Iterar com a referência**: anexar a imagem AgricAI + o `plantium-design-system.md` e pedir
  "adapte o Dashboard atual (print) para esta linguagem visual".

---

## Roadmap sugerido (ordem)

1. Tokenizar cores em CSS variables + alinhar `tailwind.config` ao design system
2. Tema claro + ThemeToggle
3. Redesenhar `StatCard` (ícone-círculo, número Sora, chip de status)
4. Adicionar `HealthGauge` agregado no Dashboard
5. Glassmorphism + sombras suaves nos cards
6. Toggle de período + paleta de gráficos alinhada
7. Polimento: chips de conexão, hover, skeletons, transições

## Links

- [`plantium-design-system.md`](plantium-design-system.md) — fonte de verdade
- [`PROMPT.md`](PROMPT.md) — prompt para gerar a landing
- Estrutura atual do app: `vault/doc/concepts/desktop-app-estrutura.md`
