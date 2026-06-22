import { NextResponse } from "next/server";

// Clima server-side. Fonte primária: INMET (estação automática, default A002 =
// Goiânia/GO) para as condições atuais; previsão de 4 dias via Open-Meteo
// (estrutura confiável). Fallback total para Open-Meteo se o INMET falhar.
// Chamado em mesma origem (respeita CSP). Cache 30 min.
export const runtime = "nodejs";
export const revalidate = 1800;

const STATION = process.env.INMET_STATION || "A002"; // Goiânia/GO
const GYN = { lat: -16.6869, lon: -49.2648 };

type Current = { temp: number; feels: number; humidity: number; precip: number; wind: number; label: string; icon: string };

function describe(code: number): { label: string; icon: string } {
  if (code === 0) return { label: "Céu limpo", icon: "sun" };
  if (code <= 2) return { label: "Parcialmente nublado", icon: "cloud-sun" };
  if (code === 3) return { label: "Nublado", icon: "cloud" };
  if (code <= 48) return { label: "Névoa", icon: "cloud" };
  if (code <= 57) return { label: "Garoa", icon: "drizzle" };
  if (code <= 67) return { label: "Chuva", icon: "rain" };
  if (code <= 77) return { label: "Neve", icon: "snow" };
  if (code <= 82) return { label: "Pancadas de chuva", icon: "rain" };
  if (code <= 86) return { label: "Neve", icon: "snow" };
  return { label: "Tempestade", icon: "storm" };
}

const num = (v: unknown): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

// Condições atuais via INMET (apitempo). Timeout curto + tolerante a falhas.
async function inmetCurrent(): Promise<Current | null> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const url = `https://apitempo.inmet.gov.br/estacao/${today}/${today}/${STATION}`;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 4500);
    const res = await fetch(url, { signal: ctrl.signal, next: { revalidate: 1800 } });
    clearTimeout(t);
    if (!res.ok) return null;
    const arr = (await res.json()) as Record<string, unknown>[];
    if (!Array.isArray(arr) || !arr.length) return null;
    // pega o registro mais recente com temperatura válida
    for (let i = arr.length - 1; i >= 0; i--) {
      const r = arr[i];
      const temp = num(r.TEM_INS);
      if (temp === null) continue;
      const humidity = num(r.UMD_INS) ?? 0;
      const precip = num(r.CHUVA) ?? 0;
      const windMs = num(r.VEN_VEL) ?? 0;
      const icon = precip > 0 ? "rain" : humidity > 85 ? "cloud" : "cloud-sun";
      const label = precip > 0 ? "Chuva" : humidity > 85 ? "Nublado" : "Parcialmente nublado";
      return { temp: Math.round(temp), feels: Math.round(temp), humidity: Math.round(humidity), precip, wind: Math.round(windMs * 3.6), label, icon };
    }
    return null;
  } catch {
    return null;
  }
}

async function openMeteo(lat: number, lon: number): Promise<{ current: Current; daily: object[] } | null> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,apparent_temperature` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=auto&forecast_days=4`;
  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return null;
    const d = await res.json();
    const cur = d.current ?? {};
    const dl = d.daily ?? {};
    const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return {
      current: {
        temp: Math.round(cur.temperature_2m), feels: Math.round(cur.apparent_temperature),
        humidity: Math.round(cur.relative_humidity_2m), precip: cur.precipitation ?? 0,
        wind: Math.round(cur.wind_speed_10m), ...describe(cur.weather_code ?? 0),
      },
      daily: (dl.time ?? []).map((t: string, i: number) => {
        const dt = new Date(t + "T12:00:00");
        return { day: dias[dt.getUTCDay()], max: Math.round(dl.temperature_2m_max[i]), min: Math.round(dl.temperature_2m_min[i]), precip: Math.round((dl.precipitation_sum[i] ?? 0) * 10) / 10, ...describe(dl.weather_code[i] ?? 0) };
      }),
    };
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = Number(searchParams.get("lat") ?? GYN.lat);
  const lon = Number(searchParams.get("lon") ?? GYN.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "coordenadas inválidas" }, { status: 400 });
  }

  // Previsão sempre Open-Meteo (estrutura confiável); atual prioriza INMET.
  const [inmet, om] = await Promise.all([inmetCurrent(), openMeteo(lat, lon)]);
  if (!inmet && !om) return NextResponse.json({ error: "clima indisponível" }, { status: 502 });

  const current = inmet ?? om!.current;
  const source = inmet ? `INMET ${STATION} · Goiânia/GO` : "Open-Meteo · Goiânia/GO";

  return NextResponse.json(
    { location: { lat, lon }, source, current, daily: om?.daily ?? [] },
    { headers: { "Cache-Control": "public, max-age=600, s-maxage=1800" } },
  );
}
