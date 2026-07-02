"use client";

import { useEffect, useState, type ReactNode } from "react";
import { EChart } from "@/components/app/echart";
import { readThemeColors } from "@/lib/plantium-charts";
import { classifyMetric, type Metric } from "@/lib/sensor-rules";
import { WeatherCard } from "@/components/app/weather-card";
import { useDemo } from "@/components/app/demo-state";
import type {
  LatestMetrics,
  OpenAlert,
  RealSummary,
  SeriesPoint,
} from "@/lib/real-data";

/**
 * Visão geral com DADOS REAIS (readings do banco). Renderizada quando a
 * empresa tem ao menos um dispositivo registrado; caso contrário o app
 * mostra o modo demonstração.
 */

const CHIP_CLS: Record<string, string> = {
  ok: "pl-chip--ideal",
  warn: "pl-chip--atencao",
  bad: "pl-chip--critico",
};

interface MetricCardDef {
  key: keyof LatestMetrics & string;
  metric: Metric;
  label: string;
  unit: string;
  icon: ReactNode;
}

const CARDS: MetricCardDef[] = [
  { key: "soilMoisture", metric: "soilMoisture", label: "Umidade do solo", unit: "%", icon: <IconDrop /> },
  { key: "airTemperature", metric: "airTemperature", label: "Temperatura do ar", unit: "°C", icon: <IconTemp /> },
  { key: "airHumidity", metric: "airHumidity", label: "Umidade do ar", unit: "%", icon: <IconDrop /> },
  { key: "co2Level", metric: "co2Level", label: "CO₂", unit: "ppm", icon: <IconCloud /> },
  { key: "phLevel", metric: "phLevel", label: "pH", unit: "", icon: <IconPh /> },
  { key: "lightLevel", metric: "lightLevel", label: "Luminosidade", unit: "lux", icon: <IconSun /> },
];

function IconDrop() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M12 3c4 4.5 6.5 7.7 6.5 11A6.5 6.5 0 0 1 5.5 14C5.5 10.7 8 7.5 12 3z" /></svg>;
}
function IconTemp() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10 13.5V5a2 2 0 0 1 4 0v8.5a4 4 0 1 1-4 0z" /></svg>;
}
function IconCloud() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 14a4 4 0 0 1 .5-7.9A5 5 0 0 1 14 5.5 3.5 3.5 0 0 1 17 14z" /><path d="M8 18h.01M12 19h.01M16 18h.01" /></svg>;
}
function IconPh() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4v9a4 4 0 0 0 8 0V4" /><path d="M3 4h12" /><path d="M19 5v6M16 8h6" /></svg>;
}
function IconSun() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" /></svg>;
}

function fmt(v: number | null, digits = 1): string {
  if (v === null) return "—";
  return v.toFixed(digits).replace(".", ",");
}

function buildLineOption(
  series: SeriesPoint[],
  defs: Array<{ key: keyof SeriesPoint & string; name: string; color: string }>,
  textColor: string,
  gridColor: string,
): object {
  return {
    animation: false,
    tooltip: { trigger: "axis" },
    legend: { textStyle: { color: textColor }, top: 0 },
    grid: { left: 44, right: 16, top: 34, bottom: 28 },
    xAxis: {
      type: "time",
      axisLabel: { color: textColor },
      axisLine: { lineStyle: { color: gridColor } },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: textColor },
      splitLine: { lineStyle: { color: gridColor } },
    },
    series: defs.map((d) => ({
      name: d.name,
      type: "line",
      showSymbol: false,
      smooth: true,
      lineStyle: { width: 2, color: d.color },
      itemStyle: { color: d.color },
      data: series
        .filter((p) => p[d.key] !== null)
        .map((p) => [p.ts, p[d.key]]),
    })),
  };
}

export function RealOverview({
  name,
  summary,
  latest,
  series,
  alerts,
}: {
  name: string;
  summary: RealSummary;
  latest: LatestMetrics;
  series: SeriesPoint[];
  alerts: OpenAlert[];
}) {
  const { theme } = useDemo();
  const [opts, setOpts] = useState<{ amb?: object; qual?: object }>({});

  useEffect(() => {
    const c = readThemeColors();
    setOpts({
      amb: buildLineOption(
        series,
        [
          { key: "soilMoisture", name: "Solo (%)", color: "#22c55e" },
          { key: "airTemperature", name: "Ar (°C)", color: "#f59e0b" },
          { key: "airHumidity", name: "Umidade ar (%)", color: "#3b82f6" },
        ],
        c.text,
        c.grid,
      ),
      qual: buildLineOption(
        series,
        [
          { key: "co2Level", name: "CO₂ (ppm)", color: "#8b5cf6" },
          { key: "phLevel", name: "pH", color: "#ef4444" },
        ],
        c.text,
        c.grid,
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, series.length]);

  const lastTs = latest.ts ? new Date(latest.ts) : null;
  const critical = alerts.filter((a) => a.severity === "critico").length;

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <h1 className="pl-font-display pl-page-title" style={{ margin: 0, fontSize: 28, fontWeight: 700, letterSpacing: "-.01em" }}>
            Olá, {name}
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: "var(--pl-text-muted)" }}>
            Dados reais dos seus dispositivos ·{" "}
            {summary.onlineCount}/{summary.deviceCount} online ·{" "}
            {lastTs
              ? `última leitura ${lastTs.toLocaleString("pt-BR")}`
              : "aguardando a primeira leitura"}
          </p>
        </div>
        <span className="pl-chip pl-chip--ideal">
          <span className="pl-chip__dot" style={{ animation: "pl-pulse 1.6s infinite" }} />
          Modo real
        </span>
      </div>

      {latest.ts === null && (
        <div className="pl-card pl-card--solid" style={{ padding: 18, fontSize: 14, color: "var(--pl-text-muted)" }}>
          Dispositivo registrado, mas nenhuma leitura recebida ainda. Grave o
          token na placa e aponte o firmware para <code>POST /api/device/telemetry</code>.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 16 }}>
        {CARDS.map((c) => {
          const v = latest[c.key] as number | null;
          const cls = classifyMetric(c.metric, v);
          return (
            <div key={c.key} className="pl-card pl-card--solid pl-sensor" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="pl-kpi__icon" style={{ width: 34, height: 34 }}>{c.icon}</span>
                <span className={"pl-chip " + (CHIP_CLS[cls.status] ?? "")}>{cls.label}</span>
              </div>
              <span style={{ fontSize: 13, color: "var(--pl-text-muted)" }}>{c.label}</span>
              <span className="pl-font-display" style={{ fontSize: 32, fontWeight: 700, lineHeight: 1 }}>
                {c.key === "lightLevel" ? fmt(v, 0) : fmt(v)}
                {c.unit && <span style={{ fontSize: 15, color: "var(--pl-text-faint)", fontWeight: 600 }}> {c.unit}</span>}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 16 }}>
        <div className="pl-card pl-card--solid" style={{ padding: 18 }}>
          <h3 className="pl-font-display" style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 600 }}>Ambiente (24h)</h3>
          {series.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--pl-text-faint)" }}>Sem leituras nas últimas 24 horas.</p>
          ) : (
            opts.amb && <EChart option={opts.amb} height={260} />
          )}
        </div>
        <div className="pl-card pl-card--solid" style={{ padding: 18 }}>
          <h3 className="pl-font-display" style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 600 }}>Qualidade (24h)</h3>
          {series.length === 0 ? (
            <p style={{ fontSize: 13, color: "var(--pl-text-faint)" }}>Sem leituras nas últimas 24 horas.</p>
          ) : (
            opts.qual && <EChart option={opts.qual} height={260} />
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 16 }}>
        <div className="pl-card pl-card--solid" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 className="pl-font-display" style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Alertas abertos</h3>
            {critical > 0 && <span className="pl-chip pl-chip--critico"><span className="pl-chip__dot" />{critical} crítico(s)</span>}
          </div>
          {alerts.length === 0 && (
            <p style={{ margin: 0, fontSize: 13, color: "var(--pl-text-faint)" }}>Nenhum alerta aberto. Tudo dentro das faixas ideais.</p>
          )}
          {alerts.slice(0, 5).map((a) => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, borderTop: "1px solid var(--pl-border-subtle)", paddingTop: 10 }}>
              <span className={"pl-chip " + (a.severity === "critico" ? "pl-chip--critico" : a.severity === "atencao" ? "pl-chip--atencao" : "pl-chip--ideal")} style={{ flexShrink: 0 }}>
                <span className="pl-chip__dot" />
                {a.severity === "critico" ? "Crítico" : a.severity === "atencao" ? "Atenção" : "Info"}
              </span>
              <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.message}</span>
              <span style={{ color: "var(--pl-text-faint)", flexShrink: 0 }}>{new Date(a.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          ))}
        </div>
        <WeatherCard />
      </div>
    </section>
  );
}
