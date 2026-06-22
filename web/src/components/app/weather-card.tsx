"use client";

import { useEffect, useState } from "react";
import { Cloud, CloudDrizzle, CloudLightning, CloudRain, CloudSnow, CloudSun, Droplets, Sun, Wind } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON: Record<string, LucideIcon> = {
  sun: Sun, "cloud-sun": CloudSun, cloud: Cloud, drizzle: CloudDrizzle, rain: CloudRain, snow: CloudSnow, storm: CloudLightning,
};

type Weather = {
  source?: string;
  current: { temp: number; feels: number; humidity: number; precip: number; wind: number; label: string; icon: string };
  daily: { day: string; max: number; min: number; precip: number; label: string; icon: string }[];
};

// Clima real (Open-Meteo) via /api/clima — externo ao DB, complementa o agro.
export function WeatherCard({ lat, lon }: { lat?: number; lon?: number }) {
  const [data, setData] = useState<Weather | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    const q = lat != null && lon != null ? `?lat=${lat}&lon=${lon}` : "";
    fetch("/api/clima" + q)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setData(d))
      .catch(() => setErr(true));
  }, [lat, lon]);

  const Cur = data ? ICON[data.current.icon] ?? Cloud : Cloud;

  return (
    <div className="pl-card pl-card--solid" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="pl-font-display" style={{ fontSize: 16, fontWeight: 600 }}>Clima · agora</span>
        <span style={{ fontSize: 12, color: "var(--pl-text-muted)" }}>{data?.source ?? "Goiânia/GO"}</span>
      </div>

      {err ? (
        <p style={{ fontSize: 13, color: "var(--pl-text-faint)" }}>Clima indisponível no momento.</p>
      ) : !data ? (
        <p style={{ fontSize: 13, color: "var(--pl-text-faint)" }}>Carregando clima…</p>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span className="pl-kpi__icon" style={{ width: 52, height: 52, background: "rgba(56,189,248,.14)", color: "var(--pl-info)" }}><Cur size={28} /></span>
            <div>
              <div className="pl-font-display" style={{ fontSize: 34, fontWeight: 700, lineHeight: 1 }}>{data.current.temp}<span style={{ fontSize: 16, color: "var(--pl-text-faint)" }}> °C</span></div>
              <div style={{ fontSize: 13, color: "var(--pl-text-muted)" }}>{data.current.label} · sensação {data.current.feels} °C</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 13, color: "var(--pl-text-muted)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Droplets size={15} className="text-brand" /> {data.current.humidity}% umidade</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><CloudRain size={15} /> {data.current.precip} mm</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Wind size={15} /> {data.current.wind} km/h</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${data.daily.length},1fr)`, gap: 8, borderTop: "1px solid var(--pl-border-subtle)", paddingTop: 12 }}>
            {data.daily.map((d, i) => {
              const I = ICON[d.icon] ?? Cloud;
              return (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 12, color: "var(--pl-text-muted)" }}>{i === 0 ? "Hoje" : d.day}</span>
                  <I size={18} className="text-brand" />
                  <span style={{ fontSize: 12.5, fontWeight: 600 }}>{d.max}°<span style={{ color: "var(--pl-text-faint)", fontWeight: 400 }}> {d.min}°</span></span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
