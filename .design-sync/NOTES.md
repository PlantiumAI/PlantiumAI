# PlantiumAI design-sync notes

## Setup
- Package: `@plantium/ui` at `packages/ui/` — tsup ESM build, entry `dist/index.js`
- No Storybook — shape = package
- Install: `cd packages/ui && npm ci` (has its own `package-lock.json`; independent from `desktop/`)
- Converter deps: `npm i esbuild ts-morph @types/react playwright typescript` inside `.ds-sync/` then `node .ds-sync/node_modules/playwright/cli.js install chromium`
- Node modules for converter: `packages/ui/node_modules` (react is hoisted there, not repo root)

## Known render warns
- (none — all clean on first sync)

## Font handling
- Inter and Sora are system/CDN fonts, not shipped with the package. Suppressed via `runtimeFontPrefixes`.
- Space Grotesk listed in CSS fallbacks (after Sora) — also suppressed.

## Overrides applied
- `Navbar`: `cardMode: "column"` — the navbar is full-width; column mode gives each story the full card width to avoid cropping.

## Theming
- Theme switched via `data-theme="light|dark"` on any ancestor element — no React provider needed.
- Glass surfaces need a colored background to show the blur effect. Use `var(--pl-bg-base)` or the brand gradient `linear-gradient(135deg, #f6faf6 0%, #e7f0ea 100%)` as a wrapper background in previews.

## Re-sync risks
- **Inline backgrounds in previews**: The `BG` wrapper in preview files uses hardcoded brand gradient values. If the brand background token changes in `styles.css`, previews won't update automatically — re-verify preview screenshots.
- **Font availability**: If Sora or Inter are later served by a CDN `@import` in the CSS, switch from `runtimeFontPrefixes` to `extraFonts` (the validator will flag `[FONT_MISSING]` when the `@import` isn't an explicit one it can harvest).
- **tsup build**: Uses `injectStyle: false` — CSS is always extracted to `dist/index.css`. If this ever changes to `injectStyle: true`, `cssEntry` must be removed and the bundle becomes self-styling (`[CSS_RUNTIME]` in validate).
- **Component count**: 9 components on first sync. New exports in `src/index.ts` will appear as `added` on next re-sync diff and will need authored previews.
