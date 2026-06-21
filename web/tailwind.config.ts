import type { Config } from "tailwindcss";

// Tokens da marca PlantiumAI (ver Brain/doc/concepts/design-system-landing.md)
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#22c55e", // Plantium Green — acento funcional
          deep: "#16a34a",
          soft: "#4ade80",
          tint: "#dcfce7",
          lime: "#84cc16",
        },
        leaf: {
          50: "#f0fdf4",
          200: "#bbf7d0",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
        },
        // Superfícies do tema escuro (alinhado ao desktop)
        surface: {
          DEFAULT: "#0b1410",
          raised: "#162820",
          overlay: "#1c2128",
          border: "#2d333b",
        },
        warn: "#f59e0b",
        danger: "#ef4444",
        info: "#38bdf8",
      },
      fontFamily: {
        display: ["Sora", "Segoe UI", "system-ui", "sans-serif"],
        sans: ["Inter", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "monospace"],
      },
      fontWeight: {
        "500": "500",
        "600": "600",
        "700": "700",
      },
      borderRadius: {
        xl: "20px",
        "2xl": "24px",
      },
      boxShadow: {
        glass: "0 8px 24px rgba(31,71,46,0.10)",
      },
      backdropBlur: {
        glass: "18px",
      },
    },
  },
  plugins: [],
};

export default config;
