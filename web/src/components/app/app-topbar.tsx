"use client";

import { useRouter } from "next/navigation";
import { useDemo } from "./demo-state";

export function AppTopbar() {
  const { setDrawer, setPanel, toggleTheme, isDark, activeAlerts, initials } = useDemo();
  const router = useRouter();

  return (
    <header id="pl-topbar" style={{ position: "sticky", top: 0, zIndex: 30, display: "flex", alignItems: "center", gap: 14, padding: "13px 28px", background: "var(--pl-surface-glass)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", borderBottom: "1px solid var(--pl-border-glass)" }}>
      <button id="pl-burger" onClick={() => setDrawer((p) => !p)} className="pl-theme-toggle" aria-label="Abrir menu" style={{ flexShrink: 0 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
      <button id="tb-loc" className="pl-btn pl-btn--secondary pl-btn--sm" style={{ gap: 9 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.2" /></svg>
        Estufa Central · SP
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9l6 6 6-6" /></svg>
      </button>
      <div style={{ flex: 1 }} />
      <button className="pl-btn pl-btn--primary pl-btn--sm" onClick={() => setPanel("data")} style={{ gap: 8 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M8 11l4 4 4-4" /><path d="M5 19h14" /></svg>
        Exportar
      </button>
      <button className="pl-theme-toggle" onClick={() => setPanel("help")} aria-label="Ajuda" style={{ flexShrink: 0 }}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1.4.8-1.4 1.7v.3" /><circle cx="12" cy="17" r=".6" fill="currentColor" /></svg>
      </button>
      <button className="pl-theme-toggle" onClick={() => router.push("/app/alertas")} aria-label="Alertas" style={{ position: "relative", flexShrink: 0 }}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-2 9-2 9h16s-2-2-2-9" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>
        {activeAlerts > 0 && <span style={{ position: "absolute", top: 5, right: 6, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 8, background: "var(--pl-danger)", color: "#fff", fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{activeAlerts}</span>}
      </button>
      <button className="pl-theme-toggle" onClick={toggleTheme} aria-label="Alternar tema" style={{ flexShrink: 0 }}>
        {isDark
          ? <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4.2" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" /></svg>
          : <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M20 14.5A8 8 0 1 1 9.5 4 6.2 6.2 0 0 0 20 14.5z" /></svg>}
      </button>
      <button onClick={() => setPanel("profile")} aria-label="Perfil" style={{ width: 38, height: 38, borderRadius: "50%", border: "none", background: "var(--pl-brand-green-tint)", color: "var(--pl-brand-green)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit", fontWeight: 700, fontSize: 14, flexShrink: 0, cursor: "pointer" }}>{initials}</button>
    </header>
  );
}
