# PlantiumAI — Design System (Landing / Site Institucional)

> Inspirado na referência visual **AgricAI** (dashboard agrícola claro, orgânico e glassmorphic) e adaptado para a marca **PlantiumAI — Micro Estufas Inteligentes**.
> Destina-se à **home/landing page** que apresenta o projeto para investidores e interessados.
> Inclui **tema claro + tema escuro** e especificação de **sistema de login**.

---

## 1. Tema Visual & Atmosfera

A interface da PlantiumAI é o oposto fotográfico de um player escuro: um ambiente **claro, orgânico e "respirável"**, onde a natureza (folhas, estufas, dados de cultivo) é a fonte de cor e o vidro fosco (glassmorphism) cria profundidade sem ruído. A filosofia é **"dados que parecem vivos"** — superfícies translúcidas flutuam sobre um fundo verde-claro suave, e o verde-folha da marca conduz o olhar para o que importa: saúde da planta, métricas e ações.

Onde o Spotify recua para o preto, a PlantiumAI **avança para a luz**: superfícies de vidro (`rgba(255,255,255,0.65)` + `backdrop-blur`), bordas quase invisíveis, sombras difusas e de baixa opacidade, e o **Plantium Green (`#22c55e`)** como acento funcional — saúde, ação, estado ativo. A tipografia é humanista e em *sentence case* (sem caixa-alta sistemática), com headings de display geométricos para a comunicação institucional.

A geometria é **arredondada e generosa**: cards de 20–24px, pílulas para seletores de período (12h/24h/48h), avatares e gauges circulares, navbar de vidro no topo. O resultado é premium, natural e confiável — o tom certo para investidores.

**Características-chave:**
- Tema claro imersivo (`#f4f7f4`–`#ffffff`) — a luz é o palco; a natureza é a cor
- **Glassmorphism**: superfícies translúcidas com `backdrop-blur` e bordas suaves
- **Plantium Green (`#22c55e`)** como acento funcional (saúde, ação, ativo) — nunca decorativo
- Sombras difusas e de baixa opacidade (`rgba(31,71,46,0.10) 0 8px 24px`) — leveza, não peso
- Tipografia humanista em *sentence case* (Sora display + Inter body), line-height confortável
- Geometria arredondada (cards 20–24px, pílulas, círculos), nada de cantos vivos
- **Dois temas**: claro (institucional/landing) e escuro (alinhado à interface operacional)
- Cores semânticas suaves: alerta âmbar (`#f59e0b`), erro coral (`#ef4444`), info céu (`#38bdf8`)

---

## 2. Paleta de Cores & Papéis (tokens light + dark)

Tokens em CSS custom properties. O tema é trocado por `data-theme="light|dark"` no `<html>`.

### Marca (independente de tema)
| Token | Valor | Uso |
|-------|-------|-----|
| `--brand-green` | `#22c55e` | Acento primário: CTA, ativo, saúde, gauges |
| `--brand-green-deep` | `#16a34a` | Hover/pressed do verde |
| `--brand-green-soft` | `#4ade80` | Verde claro, realces, gradientes |
| `--brand-green-tint` | `#dcfce7` | Fundo de chips/badges verdes (light) |
| `--brand-lime` | `#84cc16` | Verde-lima secundário (data viz) |
| `--brand-teal` | `#14b8a6` | Terceira cor de séries (data viz) |

### Tema Claro (`[data-theme="light"]`)
| Token | Valor | Papel |
|-------|-------|-------|
| `--bg-base` | `#eef3ee` | Fundo da página (gradiente para `#f6faf6`) |
| `--bg-gradient` | `linear-gradient(135deg,#f6faf6 0%,#e7f0ea 100%)` | Fundo hero/landing |
| `--surface-glass` | `rgba(255,255,255,0.65)` | Card de vidro (com `backdrop-blur: 18px`) |
| `--surface-solid` | `#ffffff` | Card sólido, modais |
| `--surface-raised` | `#f4f7f5` | Superfície sutilmente elevada |
| `--border-subtle` | `rgba(20,40,30,0.08)` | Bordas/divisores |
| `--border-glass` | `rgba(255,255,255,0.6)` | Borda interna do vidro |
| `--text-base` | `#152a1f` | Texto primário (verde-carvão) |
| `--text-muted` | `#5b6b61` | Texto secundário, labels |
| `--text-faint` | `#8a978f` | Metadados, fine print |
| `--shadow-soft` | `0 8px 24px rgba(31,71,46,0.10)` | Cards |
| `--shadow-float` | `0 16px 48px rgba(31,71,46,0.16)` | Modais, dropdowns |

### Tema Escuro (`[data-theme="dark"]`)
| Token | Valor | Papel |
|-------|-------|-------|
| `--bg-base` | `#0b1410` | Fundo da página (verde quase-preto) |
| `--bg-gradient` | `linear-gradient(135deg,#0d1b13 0%,#0a120d 100%)` | Fundo hero/landing |
| `--surface-glass` | `rgba(22,40,30,0.55)` | Card de vidro (com `backdrop-blur: 18px`) |
| `--surface-solid` | `#12211a` | Card sólido, modais |
| `--surface-raised` | `#16281e` | Superfície elevada |
| `--border-subtle` | `rgba(255,255,255,0.08)` | Bordas/divisores |
| `--border-glass` | `rgba(255,255,255,0.06)` | Borda interna do vidro |
| `--text-base` | `#eaf3ee` | Texto primário |
| `--text-muted` | `#9fb4a8` | Texto secundário |
| `--text-faint` | `#6c8478` | Metadados |
| `--accent` (override) | `#34d977` | Verde levemente mais claro no escuro |
| `--shadow-soft` | `0 8px 24px rgba(0,0,0,0.40)` | Cards |
| `--shadow-float` | `0 16px 48px rgba(0,0,0,0.55)` | Modais |

### Semânticas (ambos os temas)
| Token | Valor | Uso |
|-------|-------|-----|
| `--success` | `#22c55e` | Saúde/ideal (= brand-green) |
| `--warning` | `#f59e0b` | Atenção (umidade/temperatura no limite) |
| `--danger` | `#ef4444` | Alerta crítico, erro |
| `--info` | `#38bdf8` | Informação, dicas |
| `--success-tint` | `light: #dcfce7 / dark: rgba(34,197,94,.15)` | Fundo de chip de sucesso |
| `--warning-tint` | `light: #fef3c7 / dark: rgba(245,158,11,.15)` | Fundo de chip de atenção |
| `--danger-tint` | `light: #fee2e2 / dark: rgba(239,68,68,.15)` | Fundo de chip de erro |

### Paleta para gráficos (data viz — ECharts)
Ordem de séries: `#22c55e` → `#14b8a6` → `#84cc16` → `#38bdf8` → `#f59e0b` → `#a78bfa`.

---

## 3. Tipografia

### Famílias
- **Display / Headings**: `Sora` → fallback `"Space Grotesk", "Inter", system-ui, sans-serif` (geométrica, premium, institucional)
- **UI / Body**: `Inter` → fallback `"Segoe UI", system-ui, -apple-system, sans-serif` (já usada na interface operacional — consistência)
- **Mono (métricas/código)**: `"JetBrains Mono", Consolas, monospace`

> Importar via `@fontsource` ou Google Fonts. Inter já está no projeto; adicionar Sora.

### Hierarquia
| Papel | Fonte | Tamanho | Peso | Line-height | Notas |
|-------|-------|---------|------|-------------|-------|
| Hero Title | Sora | 56–72px (clamp) | 700 | 1.05 | Headline da landing |
| Section Title | Sora | 36–44px | 700 | 1.15 | Seções da home |
| Card Title | Sora | 20–24px | 600 | 1.25 | Título de card |
| Feature Heading | Inter | 18px | 600 | 1.35 | Sub-seções |
| Body Large | Inter | 18px | 400 | 1.6 | Parágrafo de destaque |
| Body | Inter | 16px | 400 | 1.6 | Texto padrão |
| Body Bold | Inter | 16px | 600 | 1.6 | Ênfase |
| Metric / Number | Sora | 32–48px | 700 | 1.0 | KPIs (ex.: "80% Health Score") |
| Label | Inter | 13px | 500 | 1.2 | Labels de cards (ex.: "UMIDADE DO SOLO") — *uppercase opcional* com `letter-spacing: .04em` |
| Caption | Inter | 13px | 400 | 1.5 | Metadados |
| Button | Inter | 14–15px | 600 | 1.0 | *Sentence case* (NÃO uppercase) |
| Badge | Inter | 11px | 600 | 1.3 | Chips, contadores |

### Princípios
- **Sentence case, não caixa-alta**: diferente do Spotify, botões e navegação são em *sentence case* — tom acolhedor e institucional. Caixa-alta só em labels de métrica curtos (opcional, com tracking).
- **Display vs. body**: Sora para títulos e números grandes (impacto), Inter para leitura. O contraste de famílias cria hierarquia premium.
- **Line-height generoso (1.5–1.6)**: é um site de leitura/apresentação, não um app denso. Dar respiro.
- **Números como herói**: KPIs grandes em Sora 700 (estilo "80% Health Score", "13.530 Annual Harvest").

---

## 4. Componentes

### Botões
**Primário (CTA)** — "Quero investir", "Saiba mais"
- Fundo: `--brand-green`; texto: `#ffffff`
- Padding: `12px 24px`; radius: `999px` (pílula) ou `14px` (retângulo arredondado)
- Peso 600, *sentence case*; hover: `--brand-green-deep` + leve `translateY(-1px)` + `--shadow-soft`

**Secundário (vidro/outline)**
- Fundo: `--surface-glass` + `backdrop-blur`; borda: `1px solid --border-glass`
- Texto: `--text-base`; radius: `999px`; hover: leve aumento de opacidade

**Ghost / texto**
- Sem fundo, texto `--text-muted`; hover `--text-base`

**Toggle de período (pílula segmentada)** — como `12h | 24h | 48h | A Week | A Month` da referência
- Container: `--surface-raised`, radius `999px`, padding `4px`
- Item ativo: fundo `--brand-green-tint` (light) / `rgba(34,197,94,.18)` (dark), texto `--brand-green`, radius `999px`
- Item inativo: texto `--text-muted`

### Cards (glassmorphism)
- Fundo: `--surface-glass`; `backdrop-filter: blur(18px)`
- Borda: `1px solid --border-glass`; radius: `20px` (padrão) / `24px` (destaque)
- Sombra: `--shadow-soft`; hover: `--shadow-float` + `translateY(-2px)`
- Padding interno: `20px`–`24px`
- **Card de KPI**: ícone em círculo com `--brand-green-tint`, label (Label style), número grande (Metric style), status chip embaixo

### Gauge de saúde (Health Score)
- Anel circular (SVG/ECharts), trilho `--border-subtle`, progresso em `--brand-green`
- Número central grande (Metric, Sora 700) + caption "Health Score"
- Gradiente verde opcional no arco (`--brand-green-soft` → `--brand-green`)

### Chips / Badges de status
- `Ideal` → `--success-tint` + texto `--success`
- `Atenção` → `--warning-tint` + texto `--warning`
- `Crítico` → `--danger-tint` + texto `--danger`
- Radius `999px`, padding `4px 10px`, Badge typography, com bolinha de cor à esquerda

### Inputs (e formulário de login)
- Fundo: `--surface-solid` (light) / `--surface-raised` (dark); texto `--text-base`
- Borda: `1px solid --border-subtle`; radius: `12px`; padding `12px 14px`
- Foco: borda `--brand-green` + `box-shadow: 0 0 0 3px rgba(34,197,94,.15)` (anel de foco)
- Placeholder: `--text-faint`; label acima em Label style
- Ícone à esquerda opcional (e-mail, cadeado)

### Navbar (topo, vidro)
- Container de vidro: `--surface-glass` + `backdrop-blur`, radius `999px` ou `16px`, `--shadow-soft`
- Logo folha (verde) à esquerda + wordmark "PlantiumAI"
- Tabs centrais (sentence case): `Visão geral` · `Tecnologia` · `Impacto` · `Time`
- À direita: **toggle de tema (sol/lua)**, sino de notificações, avatar circular

### Avatar
- Círculo (`50%`), borda `2px solid --surface-solid`, fallback com iniciais sobre `--brand-green`

---

## 5. Sistema de Login

### Layout
- **Tela cheia** com `--bg-gradient` + imagem de natureza/estufa desfocada ao fundo (overlay sutil)
- **Card de login central** (glassmorphism): largura `~400px`, radius `24px`, `--shadow-float`, padding `32px`
- Toggle de tema no canto superior direito

### Estrutura do card
1. Logo folha + "PlantiumAI" (Card Title)
2. Subtítulo: "Acesse o painel das suas estufas" (Body, `--text-muted`)
3. Campo **E-mail** (input com ícone)
4. Campo **Senha** (input com ícone + botão mostrar/ocultar)
5. Linha: checkbox "Lembrar-me" (esq.) · link "Esqueci a senha" (dir., `--brand-green`)
6. Botão **Entrar** (primário, largura total, pílula)
7. Divisor "ou" (linha `--border-subtle` com label central)
8. Botão **Entrar com Google** (secundário/vidro, ícone Google)
9. Rodapé: "Não tem conta? **Criar conta**" (link `--brand-green`)

### Estados
- Erro: input com borda `--danger` + mensagem em `--danger` abaixo
- Loading: botão com spinner, texto "Entrando…"
- Sucesso: redireciona ao dashboard

### Notas de implementação
- Validação client-side (e-mail válido, senha mín. 8 chars)
- Acessibilidade: `<label>` associado, `aria-invalid`, foco visível (anel verde)
- Persistência: token em `localStorage`/cookie httpOnly (conforme backend)
- O login da **landing** é institucional; o acesso real às estufas vive no **app desktop (Tauri)** — o login web pode encaminhar para download do app ou área do investidor.

---

## 6. Layout & Espaçamento

### Sistema de espaçamento (base 4px)
`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96`

### Grid
- Container máx.: `1200px` centralizado, padding lateral `24px`
- Landing em **seções verticais** (hero, problema, solução, tecnologia, métricas, time, CTA, footer)
- Dashboard de demonstração: grid de cards (auto-fit, `minmax(240px,1fr)`)

### Filosofia de espaço (oposto do Spotify)
- **Respiro generoso**: é um site de apresentação — `64–96px` entre seções, ar entre cards
- **Vidro sobre natureza**: usar imagens orgânicas como pano de fundo, cards de vidro flutuando
- **Hierarquia por tamanho + cor**: números grandes, verde para o que importa

### Escala de border-radius
| Nome | Valor | Uso |
|------|-------|-----|
| sm | 8px | Chips internos, badges |
| md | 12px | Inputs, botões retangulares |
| lg | 16px | Cards menores, navbar |
| xl | 20px | Card padrão |
| 2xl | 24px | Cards de destaque, login, modais |
| pill | 999px | Botões, toggles, navbar pílula |
| circle | 50% | Avatares, gauges, ícones |

---

## 7. Profundidade & Elevação

| Nível | Tratamento | Uso |
|-------|-----------|-----|
| Base (0) | `--bg-gradient` | Fundo da página |
| Vidro (1) | `--surface-glass` + `blur(18px)` + `--shadow-soft` | Cards, navbar |
| Elevado (2) | `--surface-solid` + `--shadow-soft` | Cards sólidos, hover |
| Flutuante (3) | `--surface-solid` + `--shadow-float` | Modais, dropdowns, login |

**Filosofia de sombra**: ao contrário do Spotify (sombras pesadas no escuro), aqui as sombras são **difusas, coloridas e suaves** (`rgba(31,71,46,…)` no claro). No tema escuro, sombras pretas mais densas. A profundidade vem do **blur do vidro + sombra leve**, não de contraste duro.

---

## 8. Do's and Don'ts

### Do
- Usar fundo claro com gradiente verde-suave; vidro fosco para os cards
- Aplicar `--brand-green` apenas em ações, estados ativos e saúde — funcional, não decorativo
- Usar `backdrop-blur` + bordas translúcidas para o efeito glass
- Sombras suaves e difusas; *sentence case* nos botões
- Line-height generoso (1.5–1.6) e bastante respiro entre seções
- Números grandes em Sora para KPIs (impacto para investidores)
- Suportar os dois temas via tokens — nunca cravar cor fixa

### Don't
- Não usar verde como cor de fundo extensa ou pura decoração
- Não usar cantos vivos — tudo arredondado (≥12px)
- Não usar caixa-alta sistemática (isso é a identidade Spotify, não a nossa)
- Não usar sombras duras/pretas no tema claro
- Não empilhar conteúdo denso como um app — a landing respira
- Não adicionar cores de marca fora da paleta (verde + neutros + semânticas)
- Não esquecer o estado de foco acessível (anel verde) em inputs e botões

---

## 9. Comportamento Responsivo

| Nome | Largura | Mudanças-chave |
|------|---------|----------------|
| Mobile | <640px | 1 coluna; navbar → menu hambúrguer; hero empilhado; CTA largura total |
| Tablet | 640–1024px | 2 colunas de cards; navbar compacta |
| Desktop | 1024–1280px | Layout completo; grid 3 colunas |
| Large | >1280px | Container 1200px centralizado; mais respiro |

- Navbar de vidro vira menu off-canvas no mobile
- Grid de KPIs: 4 → 2 → 1 colunas
- Tipografia fluida com `clamp()` (hero/section titles)
- Toggle de tema sempre acessível

---

## 10. Tema Claro ↔ Escuro

- Troca via atributo `data-theme` no `<html>` + persistência em `localStorage` (`plantium-theme`)
- Respeitar `prefers-color-scheme` na primeira visita
- Todas as cores via tokens (`var(--…)`) — zero cor hardcoded
- Transição suave: `transition: background-color .3s, color .3s`
- Ícone do toggle: sol (vai para claro) / lua (vai para escuro)
- O tema **claro** é o padrão da landing (institucional/luminoso); o **escuro** alinha com a interface operacional (Tauri)

---

## 11. Guia Rápido para Agentes de IA

### Referência de cor (tema claro)
- Fundo: `#eef3ee` (gradiente para `#f6faf6`)
- Superfície (vidro): `rgba(255,255,255,0.65)` + `backdrop-blur:18px`
- Texto: `#152a1f` · Secundário: `#5b6b61`
- Acento: Plantium Green `#22c55e`
- Borda: `rgba(20,40,30,0.08)`
- Erro: `#ef4444` · Atenção: `#f59e0b`

### Referência de cor (tema escuro)
- Fundo: `#0b1410` · Superfície vidro: `rgba(22,40,30,0.55)`
- Texto: `#eaf3ee` · Secundário: `#9fb4a8` · Acento: `#34d977`

### Exemplos de prompt de componente
- "Crie um card de KPI glassmorphic: fundo `rgba(255,255,255,0.65)` com `backdrop-blur:18px`, radius 20px, borda `rgba(255,255,255,0.6)`, sombra `0 8px 24px rgba(31,71,46,.10)`. Ícone em círculo verde-claro, label 13px Inter 500 uppercase tracking, número 40px Sora 700, chip de status 'Ideal' verde."
- "Crie um botão primário pílula: fundo `#22c55e`, texto branco, radius 999px, padding 12px 24px, Inter 600 sentence case, hover `#16a34a` + translateY(-1px)."
- "Crie um toggle segmentado de período (12h/24h/48h): container pílula `--surface-raised`, item ativo com fundo verde-tint e texto verde."
- "Crie a tela de login: fundo gradiente verde com foto de estufa desfocada, card de vidro central 400px radius 24px, campos e-mail/senha com ícone, botão Entrar verde largura total, login com Google, toggle de tema no topo."
- "Crie um gauge de Health Score: anel SVG, trilho cinza, progresso verde gradiente, número central 48px Sora 700."

### Roteiro de iteração
1. Comece no claro: fundo verde-suave + cards de vidro
2. Verde só para ação/saúde/ativo
3. Arredonde tudo (≥12px), use pílulas e círculos
4. *Sentence case*, line-height generoso, números grandes em Sora
5. Sombras difusas e suaves; profundidade pelo blur do vidro
6. Tokenize ambos os temas — a natureza nas imagens dá a cor
