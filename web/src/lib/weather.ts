// Integração de clima para contexto de irrigação.
// Primário: INMET (dados abertos, sem chave) por código de estação automática.
// Fallback: Google Weather API (Maps Platform) por lat/lng, se houver chave.
// Qualquer falha de rede retorna null — a UI degrada graciosamente.

export interface Weather {
  tempC: number | null;
  humidity: number | null;
  rainMm: number | null;
  description: string;
  source: "INMET" | "Google";
  observedAt: string | null;
}

const num = (v: unknown): number | null => {
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : null;
};

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

/** INMET: última observação horária da estação automática informada. */
async function fromInmet(station: string): Promise<Weather | null> {
  const d = today();
  const url = `https://apitempo.inmet.gov.br/estacao/${d}/${d}/${station}`;
  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    const rows = (await res.json()) as Record<string, unknown>[];
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const last = rows[rows.length - 1];
    return {
      tempC: num(last.TEM_INS),
      humidity: num(last.UMD_INS),
      rainMm: num(last.CHUVA),
      description: `Estação INMET ${station}`,
      source: "INMET",
      observedAt:
        typeof last.DT_MEDICAO === "string"
          ? `${last.DT_MEDICAO} ${last.HR_MEDICAO ?? ""}`.trim()
          : null,
    };
  } catch {
    return null;
  }
}

/** Google Weather API (Maps Platform) — condições atuais por coordenada. */
async function fromGoogle(lat: number, lng: number): Promise<Weather | null> {
  const key = process.env.GOOGLE_WEATHER_API_KEY;
  if (!key) return null;
  const url =
    `https://weather.googleapis.com/v1/currentConditions:lookup?key=${key}` +
    `&location.latitude=${lat}&location.longitude=${lng}&unitsSystem=METRIC`;
  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    const j = (await res.json()) as {
      temperature?: { degrees?: number };
      relativeHumidity?: number;
      precipitation?: { qpf?: { quantity?: number } };
      weatherCondition?: { description?: { text?: string } };
    };
    return {
      tempC: num(j.temperature?.degrees),
      humidity: num(j.relativeHumidity),
      rainMm: num(j.precipitation?.qpf?.quantity),
      description: j.weatherCondition?.description?.text ?? "Google Weather",
      source: "Google",
      observedAt: null,
    };
  } catch {
    return null;
  }
}

export async function getWeather(opts: {
  station?: string | null;
  lat?: number | null;
  lng?: number | null;
}): Promise<Weather | null> {
  if (opts.station) {
    const inmet = await fromInmet(opts.station);
    if (inmet) return inmet;
  }
  if (opts.lat != null && opts.lng != null) {
    return fromGoogle(opts.lat, opts.lng);
  }
  return null;
}
