"use client";

import { useState } from "react";
import { useDemo } from "@/components/app/demo-state";
import { senStatus } from "@/lib/plantium-demo";

export function DemoSensores() {
  const { sensores } = useDemo();
  const [filter, setFilter] = useState("todos");
  const [search, setSearch] = useState("");

  const rows = sensores
    .filter((se) => {
      if (filter === "online" && !se.online) return false;
      if (filter === "atencao" && se.status !== "atencao") return false;
      if (filter === "offline" && se.online) return false;
      const q = search.toLowerCase();
      if (q && !(se.name + " " + se.local + " " + se.type).toLowerCase().includes(q)) return false;
      return true;
    })
    .map((se) => { const ss = senStatus(se.status); return { ...se, chip: ss.c, state: ss.l }; });

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h1 className="pl-font-display pl-page-title" style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "-.01em" }}>Sensores</h1>
          <p style={{ margin: 0, fontSize: 14, color: "var(--pl-text-muted)" }}>Leituras a cada 5s · ESP32 → borda → API</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--pl-text-faint)" strokeWidth="2" strokeLinecap="round" style={{ position: "absolute", left: 12 }}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3-3" /></svg>
            <input className="pl-input" placeholder="Buscar sensor ou local…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36, borderRadius: 999, minWidth: 200, width: "auto" }} />
          </div>
          <div className="pl-period" role="tablist">
            {[["todos", "Todos"], ["online", "Online"], ["atencao", "Atenção"], ["offline", "Offline"]].map(([k, l]) => (
              <button key={k} className={"pl-period__item " + (filter === k ? "pl-period__item--active" : "")} onClick={() => setFilter(k)}>{l}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="pl-card pl-card--solid" style={{ display: "flex", flexDirection: "column", gap: 0, overflowX: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1.3fr 1.1fr .9fr .8fr 1fr", gap: 10, minWidth: 680, fontSize: 12, color: "var(--pl-text-faint)", textTransform: "uppercase", letterSpacing: ".04em", padding: "6px 4px 12px", borderBottom: "1px solid var(--pl-border-subtle)" }}>
          <span>Sensor</span><span>Local</span><span>Leitura</span><span>Estado</span><span>Sinal</span><span style={{ textAlign: "right" }}>Atualizado</span>
        </div>
        {rows.map((se) => (
          <div key={se.id} className="pl-srow" style={{ display: "grid", gridTemplateColumns: "1.7fr 1.3fr 1.1fr .9fr .8fr 1fr", gap: 10, minWidth: 680, alignItems: "center", padding: "13px 4px", borderBottom: "1px solid var(--pl-border-subtle)", fontSize: 14, transition: "background .15s" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}><span style={{ fontWeight: 600 }}>{se.name}</span><span style={{ fontSize: 12, color: "var(--pl-text-faint)" }}>{se.type}</span></div>
            <span style={{ color: "var(--pl-text-muted)" }}>{se.local}</span>
            <span style={{ fontWeight: 600 }}>{se.reading}</span>
            <span><span className={"pl-chip " + se.chip}>{se.state}</span></span>
            <span style={{ color: "var(--pl-text-muted)" }}>{se.signal}</span>
            <span style={{ textAlign: "right", color: "var(--pl-text-faint)", fontSize: 13 }}>{se.updated}</span>
          </div>
        ))}
        {rows.length === 0 && <div style={{ padding: 30, textAlign: "center", color: "var(--pl-text-faint)", fontSize: 14 }}>Nenhum sensor encontrado para este filtro.</div>}
      </div>
    </section>
  );
}
