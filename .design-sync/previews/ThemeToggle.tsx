import { ThemeToggle } from "@plantium/ui";

export function LightMode() {
  return (
    <div style={{ padding: "24px", background: "var(--pl-bg-base)", display: "flex", alignItems: "center", gap: 16 }}>
      <ThemeToggle theme="light" />
      <span style={{ fontSize: 13, color: "var(--pl-text-muted)" }}>Tema claro ativo — clique para escurecer</span>
    </div>
  );
}

export function DarkMode() {
  return (
    <div style={{ padding: "24px", background: "#0b1410", display: "flex", alignItems: "center", gap: 16 }} data-theme="dark">
      <ThemeToggle theme="dark" />
      <span style={{ fontSize: 13, color: "var(--pl-text-muted)" }}>Tema escuro ativo — clique para clarear</span>
    </div>
  );
}
