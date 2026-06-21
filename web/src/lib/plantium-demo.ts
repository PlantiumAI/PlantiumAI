// Lógica de dados SIMULADOS do dashboard pós-login — portada de
// dashboard-local.html (validado). Determinística (seed fixa) para o mesmo
// resultado no servidor e no cliente; a "liveness" vem do tick em runtime.
// (Construtores de opções ECharts ficam em plantium-charts.ts.)

export type Period = "12h" | "24h" | "Semana";
export type Reading = { soil: number; airT: number; soilT: number; airH: number; lux: number; co2: number; ph: number };
export type ThemeColors = { text: string; base: string; grid: string; surf: string };

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export const fmtDec = (n: number) => n.toFixed(1).replace(".", ",");
export const fmtInt = (n: number) => Math.round(n).toLocaleString("pt-BR");

const band = (v: number, lo: number, hi: number, soft: number) => {
  if (v >= lo && v <= hi) return 100;
  const d = v < lo ? lo - v : v - hi;
  return Math.max(0, Math.round(100 - (d / soft) * 100));
};
export const THRESHOLDS: Record<string, [number, number, number]> = {
  soil: [35, 65, 30], airT: [19, 27, 12], soilT: [16, 28, 12], airH: [50, 70, 22],
  co2: [400, 650, 400], ph: [5.5, 7.5, 2.5], lux: [12000, 24000, 14000],
};
export const score = (key: string, v: number) => { const t = THRESHOLDS[key]; return band(v, t[0], t[1], t[2]); };
export const computeHealth = (r: Reading) => {
  const w: Record<string, number> = { soil: 0.3, airT: 0.18, airH: 0.14, soilT: 0.1, co2: 0.16, ph: 0.12 };
  let num = 0, den = 0;
  Object.keys(w).forEach((k) => { num += score(k, (r as never)[k]) * w[k]; den += w[k]; });
  return Math.round(num / den);
};
export const statusOf = (sc: number) => {
  if (sc >= 80) return { c: "pl-chip--ideal", l: "Normal", col: "#22c55e", tint: "rgba(34,197,94,.14)" };
  if (sc >= 55) return { c: "pl-chip--atencao", l: "Atenção", col: "#f59e0b", tint: "rgba(245,158,11,.14)" };
  return { c: "pl-chip--critico", l: "Crítico", col: "#ef4444", tint: "rgba(239,68,68,.14)" };
};
export const healthInfo = (h: number) => {
  if (h >= 85) return { c: "pl-chip--ideal", l: "Saúde ótima" };
  if (h >= 65) return { c: "pl-chip--atencao", l: "Atenção" };
  return { c: "pl-chip--critico", l: "Crítico" };
};
const spark = (seed: number) => {
  const N = 16, pts: string[] = [];
  for (let i = 0; i < N; i++) {
    const y = 0.5 + 0.42 * Math.sin(i / 2.1 + seed) + (((i * 13 + seed * 7) % 5) - 2) * 0.05;
    const yc = clamp(y, 0.06, 0.94);
    pts.push((i / (N - 1) * 120).toFixed(1) + "," + ((1 - yc) * 30).toFixed(1));
  }
  return pts.join(" ");
};
export const buildSensor = (key: string, val: number, unit: string, dec: boolean) => {
  const sc = score(key, val), st = statusOf(sc);
  return { val: dec ? fmtDec(val) : fmtInt(val), unit, status: st.l, chip: st.c, col: st.col, tint: st.tint, pctW: sc + "%", spark: spark(key.length + val * 0.07) };
};
export const typeLabel = (t: string) => (({ estufa: "Estufa", container: "Container", vertical: "Plantação vertical", campo: "Campo aberto" } as Record<string, string>)[t] || "Local");
export const locStatus = (st: string) => st === "online" ? { c: "pl-chip--ideal", l: "Online" } : st === "atencao" ? { c: "pl-chip--atencao", l: "Atenção" } : { c: "pl-chip--critico", l: "Offline" };
export const senStatus = (st: string) => st === "normal" ? { c: "pl-chip--ideal", l: "Normal" } : st === "atencao" ? { c: "pl-chip--atencao", l: "Atenção" } : { c: "pl-chip--critico", l: "Offline" };

// PRNG determinístico (mulberry32) — substitui Math.random para SSR estável.
function makeRng(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type GenData = {
  labels: string[]; airT: number[]; soilT: number[]; soilH: number[]; airH: number[]; co2: number[]; ph: number[]; health: number[];
};
export function genData(period: Period): GenData {
  const cfg = period === "12h" ? { n: 73, stepMin: 10 } : period === "24h" ? { n: 97, stepMin: 15 } : { n: 85, stepMin: 120 };
  const n = cfg.n, labels: string[] = [], pad = (x: number) => (x < 10 ? "0" : "") + x;
  // Rótulos determinísticos a partir de um índice fixo (sem relógio real).
  if (period === "Semana") {
    const dias = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    for (let i = 0; i < n; i++) { const h = (i * cfg.stepMin / 60) % 24; labels.push(dias[Math.floor(i * cfg.stepMin / 1440) % 7] + " " + pad(Math.floor(h)) + "h"); }
  } else {
    for (let i = 0; i < n; i++) { const mins = i * cfg.stepMin; labels.push(pad(Math.floor(mins / 60) % 24) + ":" + pad(mins % 60)); }
  }
  const rng = makeRng(period.length * 1000 + n);
  const wave = (amp: number, b: number, ph: number, k: number) => {
    const a: number[] = [];
    for (let i = 0; i < n; i++) { const x = i / 4; a.push(+(b + amp * Math.sin(x / k + ph) + Math.sin(x * 1.7 + ph) * amp * 0.22 + (rng() - 0.5) * amp * 0.12).toFixed(1)); }
    return a;
  };
  const airT = wave(2.4, 24, 0.4, 2.3), soilT = wave(1.2, 22.4, 0.2, 3.0);
  const soilH = wave(7, 46, 1.2, 2.6).map((v) => Math.round(v)), airH = wave(5, 60, 0.6, 2.8).map((v) => Math.round(v));
  const co2 = wave(70, 740, 2.0, 2.2).map((v) => Math.round(v)), ph = wave(0.25, 6.4, 0.9, 3.2);
  const health = airT.map((_, i) => Math.round((score("airT", airT[i]) + score("soil", soilH[i]) + score("airH", airH[i]) + score("co2", co2[i]) + score("ph", ph[i])) / 5));
  return { labels, airT, soilT, soilH, airH, co2, ph, health };
}

// ===== Dados iniciais (mock) =====
export const INITIAL_READING: Reading = { soil: 44, airT: 24.8, soilT: 22.7, airH: 61, lux: 18400, co2: 760, ph: 6.4 };

export type Local = { id: number; name: string; type: string; unit: string; sensors: number; health: number; status: string; alerts: number; updated: string };
export const INITIAL_LOCAIS: Local[] = [
  { id: 1, name: "Estufa Central", type: "estufa", unit: "Unidade SP", sensors: 12, health: 92, status: "online", alerts: 0, updated: "agora" },
  { id: 2, name: "Container Borda A", type: "container", unit: "Unidade SP", sensors: 6, health: 74, status: "atencao", alerts: 1, updated: "há 2 min" },
  { id: 3, name: "Plantação Vertical V1", type: "vertical", unit: "Unidade SP", sensors: 8, health: 88, status: "online", alerts: 0, updated: "há 1 min" },
  { id: 4, name: "Estufa Norte", type: "estufa", unit: "Unidade MG", sensors: 10, health: 45, status: "offline", alerts: 2, updated: "há 20 min" },
];

export type Sensor = { id: number; name: string; type: string; local: string; reading: string; status: string; online: boolean; signal: string; updated: string };
export const INITIAL_SENSORES: Sensor[] = [
  { id: 1, name: "DHT22 · Ar", type: "Temp/Umid ar", local: "Estufa Central", reading: "24,8 °C · 61%", status: "normal", online: true, signal: "Forte", updated: "agora" },
  { id: 2, name: "Higrômetro solo", type: "Umidade solo", local: "Estufa Central", reading: "44%", status: "atencao", online: true, signal: "Forte", updated: "há 1 min" },
  { id: 3, name: "MH-Z19 · CO₂", type: "CO₂", local: "Plantação Vertical V1", reading: "760 ppm", status: "atencao", online: true, signal: "Médio", updated: "há 1 min" },
  { id: 4, name: "Sonda de pH", type: "pH solo", local: "Estufa Central", reading: "6,4", status: "normal", online: true, signal: "Forte", updated: "há 2 min" },
  { id: 5, name: "LDR · Luz", type: "Luminosidade", local: "Estufa Central", reading: "18.400 lux", status: "normal", online: true, signal: "Forte", updated: "agora" },
  { id: 6, name: "DS18B20 · Solo", type: "Temp. solo", local: "Container Borda A", reading: "22,7 °C", status: "normal", online: true, signal: "Médio", updated: "há 3 min" },
  { id: 7, name: "DHT22 · Ar", type: "Temp/Umid ar", local: "Estufa Norte", reading: "— sem sinal", status: "offline", online: false, signal: "—", updated: "há 20 min" },
  { id: 8, name: "Higrômetro solo", type: "Umidade solo", local: "Estufa Norte", reading: "— sem sinal", status: "offline", online: false, signal: "—", updated: "há 22 min" },
];

export type Alert = { id: number; sev: string; cat: string; title: string; local: string; time: string; resolved: boolean };
export const INITIAL_ALERTS: Alert[] = [
  { id: 1, sev: "Atenção", cat: "Irrigação", title: "Umidade do solo abaixo de 35%", local: "Estufa Central · Nó B204", time: "há 12 min", resolved: false },
  { id: 2, sev: "Crítico", cat: "Conexão", title: "Sensor offline há 20 min", local: "Estufa Norte · Nó C310", time: "há 20 min", resolved: false },
  { id: 3, sev: "Atenção", cat: "Ar", title: "CO₂ acima de 800 ppm", local: "Plantação Vertical · Nó V07", time: "há 41 min", resolved: false },
  { id: 4, sev: "Crítico", cat: "Energia", title: "Bateria do nó em 8%", local: "Container Borda A · Nó C201", time: "há 1 h", resolved: false },
  { id: 5, sev: "Atenção", cat: "Temperatura", title: "Temperatura do ar acima de 30 °C", local: "Estufa Norte", time: "há 2 h", resolved: true },
];

export type Settings = { notifEmail: boolean; notifPush: boolean; notifCrit: boolean; notifWeekly: boolean; pbiSync: boolean };
export const INITIAL_SETTINGS: Settings = { notifEmail: true, notifPush: true, notifCrit: false, notifWeekly: false, pbiSync: true };

// ===== Estatísticas (técnica) =====
const mm = (a: number[]) => { let mn = Infinity, mx = -Infinity, sum = 0; a.forEach((v) => { mn = Math.min(mn, v); mx = Math.max(mx, v); sum += v; }); const av = sum / a.length; let sd = 0; a.forEach((v) => (sd += (v - av) ** 2)); return { min: mn, max: mx, avg: av, std: Math.sqrt(sd / a.length) }; };
export function buildStats(d: GenData) {
  const stat = (name: string, arr: number[], key: string, dec: boolean, unit: string) => {
    const m = mm(arr), st = statusOf(score(key, m.avg));
    const f = (x: number) => (dec ? fmtDec(x) : Math.round(x).toLocaleString("pt-BR")) + (unit || "");
    return { name, min: f(m.min), max: f(m.max), avg: f(m.avg), std: fmtDec(m.std), chip: st.c, state: st.l };
  };
  return [
    stat("Umidade do solo", d.soilH, "soil", false, "%"),
    stat("Temperatura do ar", d.airT, "airT", true, "°"),
    stat("Umidade do ar", d.airH, "airH", false, "%"),
    stat("CO₂", d.co2, "co2", false, ""),
    stat("pH do solo", d.ph, "ph", true, ""),
    stat("Temp. do solo", d.soilT, "soilT", true, "°"),
  ];
}
