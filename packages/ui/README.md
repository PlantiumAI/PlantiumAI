# @plantium/ui

Biblioteca de componentes React do **design system PlantiumAI** (landing institucional).
Componentes autossuficientes, com tema claro/escuro via tokens CSS. Base para o `/design-sync`.

## Convenções

- **Tema:** envolva a árvore num elemento com `data-theme="light"` ou `data-theme="dark"`
  (ou defina no `<html>`). Padrão: `light`. Todas as cores vêm de CSS variables `--pl-*`.
- **Estilos:** importe uma vez `@plantium/ui/styles.css` (ou o `import "@plantium/ui"` já
  injeta via side-effect do bundle). Sem dependência de Tailwind no consumidor.
- **Tipografia:** Sora (display) + Inter (corpo) — carregue as fontes no app host.
- **Idioma das classes:** prefixo `pl-` (ex.: `pl-btn`, `pl-card`, `pl-kpi`). Cores
  funcionais em verde (`--pl-brand-green`); semânticas `--pl-success|warning|danger|info`.

## Componentes

`Button` · `Card` · `StatusChip` · `KpiCard` · `HealthGauge` · `PeriodToggle` ·
`ThemeToggle` · `Navbar` · `LoginCard`

## Uso

```tsx
import { Navbar, KpiCard, HealthGauge, Button } from "@plantium/ui";
import "@plantium/ui/styles.css";

export function App() {
  return (
    <div data-theme="light" className="pl-root">
      <Navbar
        brand="PlantiumAI"
        links={[{ label: "Solução", active: true }, { label: "Tecnologia" }]}
        theme="light"
        onToggleTheme={() => {}}
        actions={<Button size="sm">Entrar</Button>}
      />
      <KpiCard label="Umidade do solo" value="44%" status="ideal" statusLabel="Ideal" />
      <HealthGauge value={80} />
    </div>
  );
}
```

## Build

```bash
npm install
npm run build      # gera dist/ (index.js ESM + index.css + index.d.ts)
npm run typecheck
```
