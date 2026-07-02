"use client";

import { useState } from "react";
import { useDemo } from "@/components/app/demo-state";

export function DemoAlertas() {
  const { alertList, resolveAlert } = useDemo();
  const [filter, setFilter] = useState("todos");

  const rows = alertList
    .filter((a) => {
      if (filter === "resolvidos") return a.resolved;
      if (a.resolved) return false;
      if (filter === "critico") return a.sev === "Crítico";
      if (filter === "atencao") return a.sev === "Atenção";
      return true;
    })
    .map((a) => ({ ...a, chip: a.sev === "Crítico" ? "pl-chip--critico" : "pl-chip--atencao", active: !a.resolved, done: a.resolved }));

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <h1 className="pl-font-display pl-page-title" style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "-.01em" }}>Alertas</h1>
        <p style={{ margin: 0, fontSize: 14, color: "var(--pl-text-muted)" }}>Notificações de irrigação, conexão e limiares dos sensores</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
        <div className="pl-card pl-card--solid pl-kpi" style={{ gap: 8 }}><span className="pl-kpi__icon" style={{ background: "var(--pl-danger-tint)", color: "var(--pl-danger)" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4l9 16H3z" /><path d="M12 10v4" /><circle cx="12" cy="17.5" r=".6" fill="currentColor" /></svg></span><span className="pl-kpi__label">Críticos</span><span className="pl-kpi__value" style={{ fontSize: 32 }}>{alertList.filter((a) => !a.resolved && a.sev === "Crítico").length}</span></div>
        <div className="pl-card pl-card--solid pl-kpi" style={{ gap: 8 }}><span className="pl-kpi__icon" style={{ background: "var(--pl-warning-tint)", color: "var(--pl-warning)" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 8v5" /><circle cx="12" cy="16.5" r=".6" fill="currentColor" /></svg></span><span className="pl-kpi__label">Atenção</span><span className="pl-kpi__value" style={{ fontSize: 32 }}>{alertList.filter((a) => !a.resolved && a.sev === "Atenção").length}</span></div>
        <div className="pl-card pl-card--solid pl-kpi" style={{ gap: 8 }}><span className="pl-kpi__icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4 10-11" /></svg></span><span className="pl-kpi__label">Resolvidos</span><span className="pl-kpi__value" style={{ fontSize: 32 }}>{alertList.filter((a) => a.resolved).length}</span></div>
      </div>
      <div className="pl-period" role="tablist" style={{ alignSelf: "flex-start" }}>
        {[["todos", "Ativos"], ["critico", "Críticos"], ["atencao", "Atenção"], ["resolvidos", "Resolvidos"]].map(([k, l]) => (
          <button key={k} className={"pl-period__item " + (filter === k ? "pl-period__item--active" : "")} onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>
      <div className="pl-card pl-card--solid" style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {rows.map((al) => (
          <div key={al.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 0", borderBottom: "1px solid var(--pl-border-subtle)", flexWrap: "wrap" }}>
            <span className={"pl-chip " + al.chip} style={{ flexShrink: 0 }}><span className="pl-chip__dot" />{al.sev}</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 160 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{al.title}</span>
              <span style={{ fontSize: 12, color: "var(--pl-text-faint)" }}>{al.cat} · {al.local}</span>
            </div>
            <span style={{ fontSize: 13, color: "var(--pl-text-faint)", flexShrink: 0 }}>{al.time}</span>
            {al.active && <button className="pl-btn pl-btn--secondary pl-btn--sm" onClick={() => resolveAlert(al.id)} style={{ flexShrink: 0 }}>Resolver</button>}
            {al.done && <span className="pl-chip pl-chip--ideal" style={{ flexShrink: 0 }}><span className="pl-chip__dot" />Resolvido</span>}
          </div>
        ))}
        {rows.length === 0 && <div style={{ padding: 30, textAlign: "center", color: "var(--pl-text-faint)", fontSize: 14 }}>Nenhum alerta neste filtro.</div>}
      </div>
    </section>
  );
}
