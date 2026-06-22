import { NextResponse } from "next/server";

// Clima server-side via Open-Meteo (gratuito, sem chave). Chamado pelo client
// em mesma origem (respeita a CSP connect-src 'self'). Cache de 30 min.
export const runtime = "nodejs";
export const revalidate = 1800;

// WMO weather codes → rótulo pt-BR + chave de ícone.
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  // Default: Goiânia/GO (sede do projeto). Aceita lat/lon por querystring.
  const lat = Number(searchParams.get("lat") ?? "-16.6869");
  const lon = Number(searchParams.get("lon") ?? "-49.2648");
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "coordenadas inválidas" }, { status: 400 });
  }

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,apparent_temperature` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code` +
    `&timezone=auto&forecast_days=4`;

  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return NextResponse.json({ error: "fonte indisponível" }, { status: 502 });
    const d = await res.json();
    const cur = d.current ?? {};
    const dl = d.daily ?? {};
    const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

    const out = {
      location: { lat, lon },
      current: {
        temp: Math.round(cur.temperature_2m),
        feels: Math.round(cur.apparent_temperature),
        humidity: Math.round(cur.relative_humidity_2m),
        precip: cur.precipitation ?? 0,
        wind: Math.round(cur.wind_speed_10m),
        ...describe(cur.weather_code ?? 0),
      },
      daily: (dl.time ?? []).map((t: string, i: number) => {
        const dt = new Date(t + "T12:00:00");
        return {
          day: dias[dt.getUTCDay()],
          max: Math.round(dl.temperature_2m_max[i]),
          min: Math.round(dl.temperature_2m_min[i]),
          precip: Math.round((dl.precipitation_sum[i] ?? 0) * 10) / 10,
          ...describe(dl.weather_code[i] ?? 0),
        };
      }),
    };
    return NextResponse.json(out, { headers: { "Cache-Control": "public, max-age=600, s-maxage=1800" } });
  } catch {
    return NextResponse.json({ error: "falha ao consultar clima" }, { status: 502 });
  }
}
