import { and, count, eq, gte, inArray } from "drizzle-orm";
import {
  Boxes,
  Cpu,
  Layers,
  MapPinned,
  Sprout,
  Wifi,
  WifiOff,
} from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db";
import { companies, locations, readings, sensors } from "@/db/schema";
import { classifyMoisture, ruleBasedIrrigation } from "@/lib/sensor-rules";
import { KpiCard } from "@/components/kpi-card";
import { WeatherCard } from "@/components/weather-card";
import { HealthGauge } from "@/components/health-gauge";
import { OverviewTrend, type TrendRow } from "@/components/overview-trend";

const ONLINE_WINDOW_MS = 15 * 60 * 1000; // sensor "online" = leitura nos últimos 15 min
const HOUR_MS = 60 * 60 * 1000;

// Pontuação de saúde por leitura de umidade do solo (faixa ideal 35–65).
function moistureScore(value: number): number {
  const c = classifyMoisture(value);
  if (c === "optimal") return 100;
  if (c === "low" || c === "high") return 65;
  return 25; // dry / saturated
}

export default async function DashboardPage() {
  const session = await auth();
  const companyId = session!.user.companyId;

  if (!companyId) {
    return (
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="font-display text-2xl font-700">Visão geral</h1>
          <p className="text-sm text-muted">Resumo dos sensores e locais.</p>
        </header>
        <section className="rounded-2xl glass p-8 text-center text-sm text-muted">
          Sua conta ainda não está vinculada a uma empresa com dados. Assim que
          houver locais e sensores, o painel aparece aqui.
        </section>
      </div>
    );
  }

  // Contagens e lista de sensores da empresa.
  const [sensorRows, locTypeRows, locationCountRow, [company]] =
    await Promise.all([
      db
        .select({ id: sensors.id })
        .from(sensors)
        .where(eq(sensors.companyId, companyId)),
      db
        .select({ type: locations.type, n: count() })
        .from(locations)
        .where(eq(locations.companyId, companyId))
        .groupBy(locations.type),
      db
        .select({ n: count() })
        .from(locations)
        .where(eq(locations.companyId, companyId)),
      db
        .select({ lat: companies.latitude, lng: companies.longitude })
        .from(companies)
        .where(eq(companies.id, companyId))
        .limit(1),
    ]);

  const sensorIds = sensorRows.map((s) => s.id);
  const sensorCount = sensorIds.length;
  const locationCount = locationCountRow[0]?.n ?? 0;

  const byType = (t: string) => locTypeRows.find((r) => r.type === t)?.n ?? 0;
  const estufas = byType("estufa");
  const verticais = byType("plantacao_vertical");
  const containers = byType("container");

  // Leituras das últimas 24 h para os sensores da empresa.
  const since = new Date(Date.now() - 24 * HOUR_MS);
  const recent = sensorIds.length
    ? await db
        .select({
          sensorId: readings.sensorId,
          soilMoisture: readings.soilMoisture,
          airTemperature: readings.airTemperature,
          ts: readings.ts,
        })
        .from(readings)
        .where(and(inArray(readings.sensorId, sensorIds), gte(readings.ts, since)))
        .orderBy(readings.ts)
    : [];

  // Última leitura por sensor → online/offline, saúde, médias, irrigação.
  const latest = new Map<string, (typeof recent)[number]>();
  for (const r of recent) latest.set(r.sensorId, r); // ordenado asc → fica a mais recente

  const now = Date.now();
  let online = 0;
  const moistures: number[] = [];
  const temps: number[] = [];
  for (const r of latest.values()) {
    if (now - new Date(r.ts).getTime() <= ONLINE_WINDOW_MS) online += 1;
    if (typeof r.soilMoisture === "number") moistures.push(r.soilMoisture);
    if (typeof r.airTemperature === "number") temps.push(r.airTemperature);
  }
  const offline = Math.max(0, sensorCount - online);

  const health =
    moistures.length > 0
      ? Math.round(moistures.reduce((a, m) => a + moistureScore(m), 0) / moistures.length)
      : null;
  const avgMoisture =
    moistures.length > 0 ? moistures.reduce((a, m) => a + m, 0) / moistures.length : null;
  const avgTemp = temps.length > 0 ? temps.reduce((a, t) => a + t, 0) / temps.length : null;

  // Status de saúde (chip) a partir do health score.
  const healthStatus =
    health === null
      ? { label: "Sem leituras", tone: "info" as const }
      : health >= 80
        ? { label: "Saudável", tone: "brand" as const }
        : health >= 55
          ? { label: "Atenção", tone: "warn" as const }
          : { label: "Crítico", tone: "danger" as const };

  // Irrigação: avalia o sensor mais seco pela regra local (fallback sem IA).
  const driest = moistures.length > 0 ? Math.min(...moistures) : null;
  const irrigation = driest !== null ? ruleBasedIrrigation(driest) : null;
  const irrigationTone =
    irrigation === null
      ? "info"
      : irrigation.urgency === "critical"
        ? "danger"
        : irrigation.urgency === "medium"
          ? "warn"
          : "brand";

  // Tendência por hora (média de umidade do solo e temperatura do ar).
  const buckets = new Map<number, { m: number[]; t: number[] }>();
  for (const r of recent) {
    const key = Math.floor(new Date(r.ts).getTime() / HOUR_MS);
    const b = buckets.get(key) ?? { m: [], t: [] };
    if (typeof r.soilMoisture === "number") b.m.push(r.soilMoisture);
    if (typeof r.airTemperature === "number") b.t.push(r.airTemperature);
    buckets.set(key, b);
  }
  const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
  const trend: TrendRow[] = [...buckets.entries()]
    .sort((a, b) => a[0] - b[0])
    .slice(-24)
    .map(([key, b]) => ({
      label: `${new Date(key * HOUR_MS).getHours().toString().padStart(2, "0")}h`,
      soilMoisture: avg(b.m) === null ? null : Math.round(avg(b.m)! * 10) / 10,
      airTemperature: avg(b.t) === null ? null : Math.round(avg(b.t)! * 10) / 10,
    }));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-700">Visão geral</h1>
          <p className="text-sm text-muted">Monitoramento dos sensores e locais da sua empresa.</p>
        </div>
        <div className="inline-flex rounded-full glass p-1 text-xs font-600">
          {["12h", "24h", "Semana"].map((p) => (
            <span
              key={p}
              className={`rounded-full px-3 py-1.5 ${
                p === "24h" ? "bg-brand/15 text-brand" : "text-muted"
              }`}
            >
              {p}
            </span>
          ))}
        </div>
      </header>

      {/* Saúde + médias */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl glass p-6 sm:flex-row sm:gap-8">
          <HealthGauge value={health} size={150} />
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <span
              className={`rounded-full px-3 py-1 text-xs font-600 ${
                healthStatus.tone === "brand"
                  ? "bg-brand/10 text-brand"
                  : healthStatus.tone === "warn"
                    ? "bg-warn/10 text-warn"
                    : healthStatus.tone === "danger"
                      ? "bg-danger/10 text-danger"
                      : "bg-info/10 text-info"
              }`}
            >
              {healthStatus.label}
            </span>
            <p className="text-sm text-muted">
              {online}/{sensorCount} sensores online
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <KpiCard
            icon={Sprout}
            label="Umidade solo"
            value={avgMoisture === null ? "—" : `${avgMoisture.toFixed(0)}%`}
            hint="média atual"
            tone="brand"
          />
          <KpiCard
            icon={Layers}
            label="Temp. ar"
            value={avgTemp === null ? "—" : `${avgTemp.toFixed(0)}°C`}
            hint="média atual"
            tone="warn"
          />
        </div>
      </section>

      {/* Frota */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard icon={Cpu} label="Sensores" value={sensorCount} hint="instalados" />
        <KpiCard icon={Wifi} label="Online" value={online} status="ativos" tone="brand" />
        <KpiCard icon={WifiOff} label="Offline" value={offline} tone={offline > 0 ? "danger" : "brand"} hint="sem leitura recente" />
        <KpiCard icon={MapPinned} label="Locais" value={locationCount} hint="monitorados" />
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard icon={Boxes} label="Estufas" value={estufas} tone="info" />
        <KpiCard icon={Sprout} label="Plantações verticais" value={verticais} tone="info" />
        <KpiCard icon={Boxes} label="Containers" value={containers} tone="info" />
        <div className="rounded-2xl glass p-5">
          <p className="text-xs font-500 uppercase tracking-wide text-muted">Irrigação</p>
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                irrigationTone === "danger"
                  ? "bg-danger"
                  : irrigationTone === "warn"
                    ? "bg-warn"
                    : irrigationTone === "brand"
                      ? "bg-brand"
                      : "bg-info"
              }`}
            />
            <span className="text-sm font-600">
              {irrigation === null
                ? "Aguardando leituras"
                : irrigation.shouldIrrigate
                  ? irrigation.urgency === "critical"
                    ? "Irrigar — urgente"
                    : "Irrigar em breve"
                  : "Sem necessidade"}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-muted">
            {irrigation === null ? "regra local pronta" : `${irrigation.reasoning} · regra local`}
          </p>
        </div>
      </section>

      {/* Tendência */}
      <OverviewTrend data={trend} />

      {/* Clima + próximos passos */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <WeatherCard
          station={process.env.INMET_STATION}
          lat={company?.lat ?? null}
          lng={company?.lng ?? null}
        />
        <section className="rounded-2xl glass p-6">
          <h2 className="font-display text-base font-600">Próximos passos</h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-muted">
            <li>Cadastre seus locais em <strong>Locais</strong> (estufa, vertical ou container).</li>
            <li>Gere um <strong>token</strong> e grave no firmware do ESP32.</li>
            <li>Registre seus <strong>sensores</strong> e vincule ao local e token.</li>
            <li>As leituras chegam via <code className="font-mono">/api/ingest</code> e atualizam este painel.</li>
          </ul>
        </section>
      </section>
    </div>
  );
}
