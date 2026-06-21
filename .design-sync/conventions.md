# PlantiumAI Design System — conventions for the design agent

## Wrapping and setup

No React provider is required. All tokens and component styles are delivered by the bundled stylesheet. Themes are switched via a `data-theme="light|dark"` attribute on any ancestor element (typically `<html>`). Default is light — `:root` and `[data-theme="light"]` share the same declarations.

For glassmorphism cards and the Navbar to read correctly, place them on the brand gradient background:

```jsx
<div style={{ background: "linear-gradient(135deg, #f6faf6 0%, #e7f0ea 100%)", padding: "24px" }}>
  <Card>…</Card>
</div>
```

For dark-themed surfaces, set `data-theme="dark"` on the container and use `background: var(--pl-bg-base)` (resolves to `#0b1410` in dark mode).

## Styling idiom — CSS custom properties with BEM class names

This is a **CSS token + BEM class system**. Do not add Tailwind classes or inline style overrides for design-language values — use the DS's own class variants and tokens.

**Token families** (all `--pl-*`):

| Family | Key tokens | Use |
|---|---|---|
| Brand | `--pl-brand-green` `#22c55e` | Primary accent, CTAs, active state, gauge fill |
| | `--pl-brand-green-deep` `#16a34a` | Hover/pressed state |
| | `--pl-brand-green-tint` `#dcfce7` | Chip/badge backgrounds, icon circles |
| Surface | `--pl-surface-glass` | Glass card background (with `backdrop-filter: blur(18px)`) |
| | `--pl-surface-solid` | Opaque white card background |
| | `--pl-surface-raised` | Subtle elevated surface, toggle track |
| Text | `--pl-text-base` | Primary text |
| | `--pl-text-muted` | Secondary/label text |
| | `--pl-text-faint` | Placeholder / tertiary text |
| Semantic | `--pl-success` `#22c55e` · `--pl-warning` `#f59e0b` · `--pl-danger` `#ef4444` | Status colours |
| | `--pl-success-tint` · `--pl-warning-tint` · `--pl-danger-tint` | Chip/badge tinted backgrounds |
| Shadow | `--pl-shadow-soft` | Default card shadow |
| | `--pl-shadow-float` | Elevated / modal shadow |

**Typography classes:**
- `.pl-root` — sets Inter body font on a container
- `.pl-font-display` — Sora / Space Grotesk for headings and display values

**Component class vocabulary (BEM — use these for your own layout glue, never redefine them):**
- Buttons: `.pl-btn` `.pl-btn--primary` `.pl-btn--secondary` `.pl-btn--ghost` `.pl-btn--sm` `.pl-btn--lg` `.pl-btn--block`
- Cards: `.pl-card` `.pl-card--solid` `.pl-card--feature` `.pl-card--hover`
- Status chips: `.pl-chip` `.pl-chip--ideal` `.pl-chip--atencao` `.pl-chip--critico` `.pl-chip--neutro`
- KPI card: `.pl-kpi` `.pl-kpi__icon` `.pl-kpi__label` `.pl-kpi__value` `.pl-kpi__sub`
- Gauge: `.pl-gauge` `.pl-gauge__center` `.pl-gauge__value` `.pl-gauge__label`
- Period toggle: `.pl-period` `.pl-period__item` `.pl-period__item--active`
- Theme toggle: `.pl-theme-toggle`
- Navbar: `.pl-navbar` `.pl-navbar__brand` `.pl-navbar__logo` `.pl-navbar__links` `.pl-navbar__link` `.pl-navbar__link--active` `.pl-navbar__actions`
- Login: `.pl-login` `.pl-field` `.pl-field__label` `.pl-input` `.pl-login__link` `.pl-login__divider`

## Where the truth lives

Read `_ds_bundle.css` (shipped component styles + full token definitions) and `styles.css` (the import entry) before styling. Each component's `<Name>.prompt.md` documents its props.

## Idiomatic usage example

```jsx
import { KpiCard, StatusChip, Card, Button } from "@plantium/ui";

// Sensor dashboard panel
<div data-theme="light" style={{ background: "var(--pl-bg-gradient)", padding: 24 }}>
  <Card variant="glass" hover>
    <KpiCard
      label="Umidade do solo"
      value="44%"
      sub="Solo: 22,7 °C"
      status="ideal"
      statusLabel="Ideal"
    />
  </Card>
  <Button variant="primary">Acionar irrigação</Button>
</div>
```
