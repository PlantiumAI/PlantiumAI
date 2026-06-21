# Prompt para Claude Design — Painel pós-login (Dashboard) PlantiumAI

> Versão melhorada e fundamentada no nosso projeto real (modelo de dados, faixas de sensores,
> eventos e design system). Cole o prompt abaixo e **anexe a imagem de referência** (card escuro
> com gauge de Health Score) + o `plantium-design-system.md`.
>
> **Contexto de escopo (honestidade técnica):** o protótipo atual é **local** (ESP32 → núcleo
> Rust/Tauri → SQLite, decisão de irrigação offline). Nuvem, **painel web**, WebSocket e Raspberry
> Pi são **arquitetura futura** do nosso Trabalho Científico. Esta tela **é** esse painel web
> planejado — então projete-a como o produto-alvo, mantendo a linguagem de "planejado/em evolução"
> onde fizer sentido.

---

## Prompt (copie a partir daqui)

Atue como **Designer UI/UX Sênior + Engenheiro Front-end**. Construa a **interface autenticada
(pós-login)** da plataforma **PlantiumAI — Micro Estufas Inteligentes**: um **painel web** de
monitoramento em tempo real. Use a **imagem anexa** como referência de estética (card escuro
glassmorphic, gauge circular de "Health Score", toggle de período 12h/24h/Semana, KPIs grandes,
rodapé "Núcleo Rust avaliando irrigação · regra local OK") e o **`plantium-design-system.md`** anexo
como **fonte de verdade** de tokens, tipografia e componentes.

Entregue **React + Vite + Tailwind CSS + ECharts** (mesma stack do nosso app), componentizado e
pronto para `npm run dev`. Reutilize os componentes do nosso design system (`@plantium/ui`:
`Navbar`, `Card`, `KpiCard`, `HealthGauge`, `StatusChip`, `PeriodToggle`, `ThemeToggle`, `Button`)
e crie os que faltarem no mesmo idioma visual. Conteúdo em **português**.

### Identidade e regras visuais
- Marca PlantiumAI; verde **`#22c55e`/`#34d977`** funcional (saúde, ativo, ação) — nunca decorativo.
- **Dois temas** (claro/escuro) via `data-theme` + `localStorage` (`plantium-theme`), respeitando
  `prefers-color-scheme`. Estética futurista/HUD discreta: **glassmorphism**, cantos arredondados
  (≥12px), sombras suaves, **sentence case**, números grandes em **Sora** + corpo em **Inter**.
- Animações suaves e curtas (entrada de cards, atualização de valores, anel do gauge). Acessível
  (foco visível verde, `aria-*`, contraste AA). **Mobile-first**, responsivo desktop/tablet/celular.

### Layout (app shell)
- **Sidebar** colapsável (vira drawer/bottom-nav no mobile): Dashboard · Locais monitorados ·
  Sensores · Alertas · Histórico · Empresa · Configurações · Perfil. Logo PlantiumAI no topo;
  rodapé com avatar do usuário + chip de status de conexão.
- **Topbar**: nome do local/seleção de unidade, busca, sino de alertas (com badge de contagem),
  `ThemeToggle`, avatar.

### 1. Dashboard (visão geral)
Use **exatamente os sensores e faixas reais** do PlantiumAI (não invente outros):

| Métrica | Campo | Unidade | Faixa válida | Faixa ideal / regra |
|---|---|---|---|---|
| Umidade do solo | `soil_moisture` | % | 0–100 | ideal **35–65**; classes: seco <20, baixo <35, ótimo 35–65, alto ≤80, saturado >80 |
| Temperatura do ar | `air_temperature` | °C | −10 a 60 | — |
| Temperatura do solo | `soil_temperature` | °C | −10 a 60 | — |
| Umidade do ar | `air_humidity` | % | 0–100 | — |
| Luminosidade | `light_level` | lux | 0–150.000 | — |
| CO₂ | `co2_level` | ppm | 200–2.000 | — |
| pH do solo | `ph_level` | — | 0–14 | levemente ácido ~5.5–7.5 |

- **Cards de KPI da frota** (topo): Total de sensores · Sensores online · Sensores offline ·
  Total de estufas · Containers ativos · Plantações verticais. Cada um com ícone-círculo, número
  grande e variação/estado.
- **Card de saúde** (como na imagem): `HealthGauge` circular grande com **Health Score (%)** —
  defina-o como **média ponderada dos sensores dentro da faixa ideal** (ex.: umidade do solo na
  faixa 35–65 contribui 100%); abaixo, `StatusChip` "Umidade ótima/atenção/crítico". Ao lado,
  KPIs de umidade do solo e temperatura do ar (espelhe o layout da referência).
- **Toggle de período** 12h / 24h / Semana (componente `PeriodToggle`).
- **Gráficos ECharts** (linha/área, tema-aware): Temperatura (ar × solo), Umidade (solo × ar),
  CO₂, pH — paleta de séries do design system (`#22c55e → #14b8a6 → #84cc16 → #38bdf8`).
- **Faixa de status de irrigação** (rodapé do card, como na imagem): barra de progresso "Núcleo
  avaliando irrigação" + selo **"regra local OK"** quando em modo fallback. Reflita os estados
  reais: decisão por **4 níveis de urgência** (nenhuma/média/alta/crítica) e a origem da decisão
  (`IA` ou `regra_local`).
- **Alertas recentes**: lista com severidade **crítico/atenção** (cores semânticas), categoria
  (irrigação), título e horário. Vazio → "Nenhum alerta. Tudo dentro do ideal."

### 2. Locais monitorados
Cards + tabela alternáveis: Nome (ex.: "Estufa · Nó A101"), Tipo (Estufa / Container / Plantação
vertical), nº de sensores, Status (online/offline/demo), Última atualização. Incluir uma **visão
geral** (cards) e, como item planejado, um **mapa** dos locais (placeholder elegante).

### 3. Sensores
Tabela: ID · Nome · Tipo (umidade solo, DHT22 ar, CO₂, pH, luz, temp. solo) · Local · Status ·
Última leitura · Data de cadastro · Token de autenticação (mascarado, com copiar). Ações por linha:
Visualizar · Editar · Remover · **Gerar novo token**. Filtros por tipo/local/status e busca.

### 4. Dashboard dinâmico por sensor (drill-down)
Ao abrir um sensor, uma visão dedicada conforme o tipo:
- **Temperatura** → valor atual grande + gráfico temporal + min/máx do período.
- **Umidade** → % atual + classe (seco→saturado) + histórico + alertas relacionados.
- **CO₂** → ppm atual + média diária + faixa.
- **pH** → valor atual + faixa ideal destacada (gauge linear).
- **Luminosidade** → lux atual + ciclo dia/noite.

### 5. Alertas / Histórico / Empresa / Configurações / Perfil (telas de apoio)
- **Alertas**: timeline filtrável por severidade/categoria/local.
- **Histórico**: tabela + export (CSV/PDF) — *export é item planejado*.
- **Empresa**: dados da organização, unidades, membros (multiusuário é **arquitetura futura**).
- **Configurações**: perfil de planta (nome, umidade ideal mín/máx — padrão 35/65), tema,
  frequência de atualização, conectividade.
- **Perfil**: dados do usuário, troca de senha, sessões.

### 6. Integração e tempo real
- A interface consome uma **API REST** e, futuramente, **WebSocket** para streaming ao vivo.
  Modele os componentes para **atualização em tempo real** (estado reativo, "última atualização há
  Xs", reconexão). Use uma **camada de dados desacoplada** (ex.: hook `useLiveData`) com **dados
  simulados (mock) plugáveis** para a demo, trocáveis pelo backend real sem mexer na UI.
- Espelhe os **eventos do nosso núcleo** na semântica da UI: `sensor:reading` (nova leitura),
  `sensor:alert` (alerta), `conn:status` (connected/disconnected/demo). Estados de fonte:
  `simulated`, `serial`, `regra_local`.
- Fluxo-alvo (arquitetura futura): **Sensores ESP32 → (Raspberry Pi, opcional na borda) → API →
  Banco de dados → Dashboard → Usuário**. Deixe claro na copy o que é tempo real vs. histórico.

### 7. Compatibilidade
Rodar em **localhost**, servidor **Linux**, **Docker** e **Vercel**. Variáveis de ambiente para a
URL da API (`VITE_API_URL`), build estático, sem segredos no front. Estrutura organizada e coerente
com o nosso app existente.

### Entregáveis
1. Código React+Vite+Tailwind componentizado (app shell, páginas, componentes), usando `@plantium/ui`.
2. `tailwind.config` + CSS variables dos **dois temas** (tokens do design system).
3. Camada de dados com mock plugável + tipos dos sensores (campos reais acima).
4. Estados de loading (skeletons), vazio e erro; responsivo e acessível.
5. Instruções de execução e de troca do mock pela API real.

Capriche no acabamento premium e na sensação de "tempo real". Use os números/faixas reais acima e
mantenha a separação entre o que é dado ao vivo, histórico e funcionalidade planejada.

---

## Dica de uso
- Anexe a imagem de referência + `plantium-design-system.md`. Se a ferramenta limitar anexos, cole
  o conteúdo do design system inline antes de anexar a imagem.
- Peça ao final: *"renderize o dashboard no tema escuro e no claro, em desktop e mobile"*.
