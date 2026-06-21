import { CloudRain, Droplets, Thermometer } from "lucide-react";
import { getWeather } from "@/lib/weather";

// Server Component assíncrono: busca o clima para contexto de irrigação.
export async function WeatherCard({
  station,
  lat,
  lng,
}: {
  station?: string | null;
  lat?: number | null;
  lng?: number | null;
}) {
  const w = await getWeather({ station, lat, lng });

  return (
    <div className="rounded-2xl glass p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-600">Clima</h2>
        {w && (
          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand">
            {w.source}
          </span>
        )}
      </div>

      {!w ? (
        <p className="mt-3 text-sm text-muted">
          Clima indisponível. Configure <code className="font-mono">INMET_STATION</code>{" "}
          (código da estação automática) ou{" "}
          <code className="font-mono">GOOGLE_WEATHER_API_KEY</code> + coordenadas da empresa.
        </p>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center">
            <div>
              <Thermometer className="mx-auto text-warn" size={18} />
              <p className="mt-1 font-display text-xl font-700">
                {w.tempC !== null ? `${w.tempC.toFixed(0)}°` : "—"}
              </p>
              <p className="text-xs text-muted">Temp.</p>
            </div>
            <div>
              <Droplets className="mx-auto text-info" size={18} />
              <p className="mt-1 font-display text-xl font-700">
                {w.humidity !== null ? `${w.humidity.toFixed(0)}%` : "—"}
              </p>
              <p className="text-xs text-muted">Umidade</p>
            </div>
            <div>
              <CloudRain className="mx-auto text-brand" size={18} />
              <p className="mt-1 font-display text-xl font-700">
                {w.rainMm !== null ? `${w.rainMm.toFixed(1)}` : "—"}
              </p>
              <p className="text-xs text-muted">Chuva mm</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted">
            {w.description}
            {w.observedAt ? ` · ${w.observedAt}` : ""}
            {w.rainMm !== null && w.rainMm > 0
              ? " · chuva recente pode dispensar irrigação"
              : ""}
          </p>
        </>
      )}
    </div>
  );
}
