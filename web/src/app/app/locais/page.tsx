"use client";

import { useDemo } from "@/components/app/demo-state";
import { locStatus, statusOf, typeLabel } from "@/lib/plantium-demo";

export default function LocaisPage() {
  const { locais, setPanel } = useDemo();
  const view = locais.map((lo) => {
    const ls = locStatus(lo.status), hc = statusOf(lo.health);
    const al = lo.alerts === 0 ? { c: "pl-chip--ideal", l: "Sem alertas" } : lo.status === "offline" ? { c: "pl-chip--critico", l: lo.alerts + " alertas" } : { c: "pl-chip--atencao", l: lo.alerts + (lo.alerts > 1 ? " alertas" : " alerta") };
    return { ...lo, typeLabel: typeLabel(lo.type), statusChip: ls.c, statusLabel: ls.l, healthPct: lo.health + "%", healthChip: hc.c, alertChip: al.c, alertLabel: al.l };
  });

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h1 className="pl-font-display pl-page-title" style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "-.01em" }}>Locais monitorados</h1>
          <p style={{ margin: 0, fontSize: 14, color: "var(--pl-text-muted)" }}>{locais.length} locais · {locais.filter((l) => l.status === "online").length} online · {locais.filter((l) => l.alerts > 0).length} com alertas</p>
        </div>
        <button className="pl-btn pl-btn--primary" onClick={() => setPanel("addLocal")} style={{ gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>Adicionar local
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(258px,1fr))", gap: 16 }}>
        {view.map((lo) => (
          <div key={lo.id} className="pl-card pl-card--solid pl-sensor" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
              <span className="pl-kpi__icon" style={{ width: 44, height: 44 }}><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M4 11l8-6 8 6v9H4z" /><path d="M9 20v-5h6v5" /></svg></span>
              <span className={"pl-chip " + lo.statusChip}><span className="pl-chip__dot" />{lo.statusLabel}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span className="pl-font-display" style={{ fontSize: 17, fontWeight: 600 }}>{lo.name}</span>
              <span style={{ fontSize: 13, color: "var(--pl-text-muted)" }}>{lo.typeLabel} · {lo.unit}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontSize: 13, color: "var(--pl-text-muted)" }}>Saúde da área</span>
              <span className={"pl-chip " + lo.healthChip}>{lo.healthPct}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--pl-border-subtle)", paddingTop: 13 }}>
              <span style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 7, color: "var(--pl-text-muted)" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" /></svg>{lo.sensors} sensores
              </span>
              <span className={"pl-chip " + lo.alertChip}>{lo.alertLabel}</span>
            </div>
            <span style={{ fontSize: 12, color: "var(--pl-text-faint)" }}>Atualizado {lo.updated}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
