# Prompt para ClaudeDesign — Home Page oficial PlantiumAI

> Versão melhorada e fundamentada no Trabalho Científico (FATESG/SENAI, 2026) e no
> `plantium-design-system.md`. Cole o prompt abaixo e **anexe os 6 arquivos** listados no
> "Manifesto de anexos". Os dados financeiros, técnicos e de mercado são reais — extraídos do
> documento — então não invente números nem promessas.

---

## Manifesto de anexos (anexar nesta ordem)

1. **`logo-plantiumai.png`** — logo circular (P com folhas verdes + circuitos sobre fundo escuro premium).
2. **`foto-thyago.jpg`** — Thyago Henrique Toledo de Assis.
3. **`foto-joao.jpg`** — João Felipe Antunes Ribeiro.
4. **`foto-gabriel.jpg`** — Gabriel Augusto de Sousa.
5. **`foto-marco.jpg`** — Marco Antônio Moreira de Freitas (o de barba / blazer azul-marinho).
6. *(opcional)* `plantium-design-system.md` — tokens de cor, tipografia e componentes.

> ⚠️ Confira a correspondência foto↔pessoa antes de anexar. Marco é o membro mais sênior
> (barba, blazer azul). Os outros três são jovens — ajuste a ordem se necessário.

---

## Prompt (copie a partir daqui)

Atue como **Designer UI/UX Sênior + Engenheiro Front-end + Copywriter de Conversão**. Gere a
**Home Page oficial do PlantiumAI** — site institucional para **investidores, parceiros e o
Desafio AgroStartup 2026**. Entregue **código React + Vite + Tailwind CSS** (mesma stack do nosso
app), componentizado e pronto para `npm run dev`, com **conteúdo textual final em português**.

**Regra de ouro (rigor científico):** todos os números, tecnologias e parcerias abaixo são reais,
extraídos do nosso Trabalho Científico. **Não invente dados, não prometa em absoluto** ("garante",
"elimina", "revoluciona"). Use tom técnico-profissional e verbos moderados ("pode auxiliar",
"apresenta potencial", "os resultados indicam"). Separe sempre **o que já é protótipo funcional**
do que é **arquitetura futura**.

### 1. Identidade visual
- **Logo** (anexo 1): P estilizado unindo folhas verdes vibrantes e trilhas de circuito
  dourado-esverdeadas sobre fundo escuro premium. Use-o no header e no footer.
- **Estética:** *dark premium como padrão* (alinhada ao logo) — grafite/verde quase-preto
  (`#0b1410`, `#12211a`), verde tecnológico (`#22c55e`/`#34d977`) **funcional** (CTA, ativo, dados),
  detalhes em verde-claro/dourado sutil, texto branco/verde-claro.
- **Tema claro/escuro:** implemente **toggle** (sol/lua), via `data-theme` + `localStorage`
  (`plantium-theme`), respeitando `prefers-color-scheme`. Tema claro = fundo verde-suave luminoso.
- **Glassmorphism**, cantos arredondados (≥12px), sombras suaves, *sentence case* (sem caixa-alta
  sistemática). Fontes: **Sora** (títulos/números) + **Inter** (corpo). (Detalhes no design system anexo.)
- **Acessibilidade:** contraste AA, foco visível (anel verde), `aria-*` no toggle e nos botões.

### 2. Estrutura da página

**A. Header + Hero**
- Header de vidro: logo + "PlantiumAI", navegação (Solução · Tecnologia · Mercado · Equipe ·
  Contato), toggle de tema e botão "Falar com a equipe".
- Hero com imagem de estufa/horta vertical ao fundo + overlay escuro.
  - **Headline:** algo como *"O equilíbrio entre a biocenose e a inteligência artificial"*.
  - **Sub-headline:** "Sistema inteligente de monitoramento para micro estufas e hortas verticais,
    integrando sensores IoT, visão computacional e IA para apoiar a decisão do pequeno produtor."
  - **CTAs:** "Conhecer o protótipo" (primário) + "Falar com um especialista" (secundário).
  - **Selos de credibilidade** (chips): "Desafio AgroStartup 2026", "Goiás", "Open-source no GitHub".

**B. O problema (dor do produtor)**
- Dor principal (real): a carência de leitura do **equilíbrio biológico (biocenose)** do ambiente
  dificulta o ajuste da irrigação, gerando desperdício de água, risco de doenças e necessidade de
  acompanhamento constante. Fonte: levantamento **IFAG (2026)** junto a produtores goianos.
- Dores secundárias em cards: desperdício de água · falta de automação · monitoramento remoto difícil ·
  ausência de histórico/rastreabilidade · falta de alertas inteligentes · baixa previsibilidade.

**C. A solução / Como funciona (arquitetura em 4 camadas — protótipo funcional)**
Diagrama/stepper horizontal com o fluxo real:
`Nós ESP32 (NDJSON 115200 baud / MQTT Wi-Fi)` → `Núcleo Rust + tokio (validação, domínio, regras, SQLite)`
→ `Gateway de IA com failover (Circuit Breaker + fallback "regra_local")` → `Interface React/TS + ECharts (tempo real)`
→ `Atuadores: relé NF + válvula solenoide (malha fechada, seguro em falha)`.
- Destaque o **fail-safe**: a estufa permanece protegida mesmo **sem internet/IA** — decisão de
  irrigação local por regras, tudo registrado em SQLite para auditoria.
- Domínio (dados reais): faixas validadas por sensor (umidade 0–100%, temp. ar −10 a 60 °C,
  luminosidade 0–150.000 lux, CO₂ 200–2.000 ppm, pH 0–14); umidade do solo em 5 níveis
  (seco/baixo/ótimo/alto/saturado), faixa ideal padrão 35–65%; irrigação em 4 níveis de urgência.

**D. Matriz de vantagens competitivas (4 pilares)**
Tabela/cards comparando PlantiumAI nos cenários Regional (Goiás) · Nacional · Internacional:
1. **Preço (acessibilidade real):** kit do protótipo funcional **R$ 1.010,08/unidade**; kit completo
   (com evolução) **R$ 1.705,22**. Modelo **SaaS** (assinatura recorrente + kit inicial), focado no
   pequeno produtor — frente ao investimento muito maior de instalações comerciais completas.
2. **Design (leveza):** desktop em **Tauri 2 + Rust + React/TS + Tailwind + ECharts**; binários
   nativos compactos que reutilizam o webview do SO; segurança de memória do Rust no I/O serial.
3. **Tecnologia (offline-first resiliente):** opera **sem depender de nuvem**; decisão local por
   regras + **SQLite**; padrão **Circuit Breaker**; arquitetura preparada para visão computacional na
   borda (**YOLO** via Raspberry Pi, opcional) com **TurboQuantização** — *itens da evolução futura*.
4. **Serviço (inserção regional):** ecossistema de inovação de Goiás — **Desafio AgroStartup 2026**
   (SENAR, Sebrae GO, FAPEG); parceria com **VarejoIN/FPM** (Prof. Renato Ribeiro dos Santos);
   cooperação tecnológica com a **SiriNEO Technologies** (egressos do ITA); validação agronômica
   nativa no core; atendimento conversacional via **WhatsApp** *(planejado)*.

**E. Showcase (hardware + software)**
- Use a imagem de sensores IoT para ilustrar os nós: umidade/temperatura do ar (**DHT22/AM2302**) e
  solo (**capacitivo anti-corrosão v1.2**), relé NF, válvula solenoide, sensor de fluxo, estrutura MDF.
- Mini-galeria do app (cards de KPI + gauge de "Health Score" + gráfico ECharts) em ambos os temas.
- Boas práticas: Git + **GitHub Actions** (build Windows/Linux), testes unitários em Rust,
  **simulador embutido** (demonstração sem hardware).

**F. Mercado e viabilidade (para investidores)**
- **TAM / SAM / SOM** (explique cada sigla na 1ª ocorrência): TAM = mercado global de agricultura
  protegida + vertical farming, com crescimento anual composto **próximo a 15%** (Vertical Field, 2024);
  SAM = horticultura protegida e pequenos produtores no Brasil; SOM = Goiás e Centro-Oeste no curto
  prazo. Apresente como estimativas a refinar com os pilotos (não cravar valores absolutos).
- **Custos do piloto (reais):** OpEx **R$ 460,00/mês** (a partir do 4º mês); implantação do piloto
  **R$ 43.048,74** — abaixo da meta (R$ 52.940,00) e do limite do edital (R$ 60.000,00).
  Conectividade alternativa **Starlink** onde não há 4G: antena R$ 2.800,00 (única) + R$ 275,00/mês.
- Apresente esses números como **KPIs grandes** (Sora 700) com rótulo e nota de fonte.

**G. Equipe / Fundadores** (cards elegantes com as fotos anexas — foto circular ou topo do card):
1. **Thyago Henrique Toledo de Assis** — *Owner, Desenvolvedor Full-Stack e Responsável Financeiro.*
   Lidera o ecossistema de software (Rust/Tauri 2) e o repositório oficial no GitHub; conduz o
   levantamento de custos, a análise econômica e a viabilidade financeira do piloto.
2. **João Felipe Antunes Ribeiro** — *Owner, Responsável por Hardware e Regra de Negócio.*
   Planeja, valida e especifica os componentes físicos, sensores e atuadores; articula a inserção
   comercial e a modelagem de mercado (parceria VarejoIN/FPM).
3. **Gabriel Augusto de Sousa** — *Owner, Arquitetura ESP32/Sensores e Cooperação Tecnológica.*
   Desenha a arquitetura IoT distribuída e o firmware dos nós ESP32; é a ponte de cooperação
   tecnológica com a SiriNEO Technologies (egressos do ITA).
4. **Marco Antônio Moreira de Freitas** — *CEO e Agrônomo.*
   Lidera a visão estratégica e a validação agronômica (faixas ideais, limiares de estresse,
   parametrização da IA), alinhando o sistema às dores reais mapeadas pelo IFAG.

> Crédito acadêmico (rodapé da seção): Trabalho Científico — Engenharia de Software, Faculdade
> SENAI FATESG, Goiânia/GO, 2026. Orientador: Prof. Renato Ribeiro dos Santos.

**H. CTA final + Footer**
- Faixa de CTA: "Vamos cultivar o futuro juntos" + botões "Falar com a equipe" / "Ver no GitHub".
- Footer com logo, canais oficiais reais: **plantiumai@gmail.com** · YouTube **@PlantiumAI** ·
  GitHub **github.com/ThyagoToledo/PlantiumAI**. Nota: "Funcionalidades de nuvem, painel web, app
  móvel e visão computacional fazem parte da evolução planejada."

### 3. Imagens de apoio (use nos fundos/ilustrações)
- Banner (estufa/horta vertical): `https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=1600`
- Tecnologia (sensores IoT): `https://images.unsplash.com/photo-1563749023136-7008a799612a?q=80&w=1000`
- Monitoramento/precisão: `https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?q=80&w=1000`
- Logo e fotos da equipe: arquivos anexos (manifesto acima).

### 4. O que entregar
1. Código React + Vite + Tailwind componentizado: `Header`, `Hero`, `ProblemSection`,
   `SolutionFlow`, `CompetitiveMatrix`, `Showcase`, `MarketSection` (KPIs), `TeamSection`,
   `CTASection`, `Footer`, `ThemeToggle`.
2. `tailwind.config` + CSS variables dos **dois temas** (tokens do design system).
3. **Micro-copy de alto impacto** para títulos e botões (forneça 2 variações por CTA).
4. Instruções curtas para rodar e onde trocar imagens/fotos.
5. Responsivo (mobile → desktop) e acessível.

Capriche no acabamento premium e na narrativa de investimento — sem exageros, com os números reais
acima e a separação clara entre protótipo e futuro.

---

## Dica de uso
- Se a ferramenta limitar anexos, cole o conteúdo de `plantium-design-system.md` inline antes de
  anexar logo e fotos.
- Peça ao final: *"renderize um preview da home no tema escuro e no claro"*.
