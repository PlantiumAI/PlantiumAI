import { and, count, desc, eq, gte, inArray } from "drizzle-orm";
import {
  Bell,
  Cpu,
  Droplet,
  Droplets,
  FlaskConical,
  MapPinned,
  Sun,
  Thermometer,
  Wifi,
  WifiOff,
  Wind,
} from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db";
import { companies, locations, readings, sensors } from "@/db/schema";
import {
  classifyMetric,
  classifyMoisture,
  ruleBasedIrrigation,
  type Metric,
} from "@/lib/sensor-rules";
import { KpiCard } from "@/components/kpi-card";
import { WeatherCard } from "@/components/weather-card";
import { HealthGauge } from "@/components/health-gauge";
import { SensorCard } from "@/components/sensor-card";
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

// Métricas exibidas como cards de sensor (espelham o design do Claude Design).
type MetricField =
  | "soilMoisture"
  | "airTemperature"
  | "airHumidity"
  | "co2Level"
  | "phLevel"
  | "lightLevel";

const METRICS: {
  key: Metric;
  field: MetricField;
  label: string;
  icon: typeof Droplet;
  unit?: string;
  decimals: number;
}[] = [
  { key: "soilMoisture", field: "soilMoisture", label: "Umidade do solo", icon: Droplet, unit: "%", decimals: 0 },
  { key: "airTemperature", field: "airTemperature", label: "Temperatura do ar", icon: Thermometer, unit: "°C", decimals: 1 },
  { key: "airHumidity", field: "airHumidity", label: "Umidade do ar", icon: Droplets, unit: "%", decimals: 0 },
  { key: "co2Level", field: "co2Level", label: "CO₂", icon: Wind, unit: " ppm", decimals: 0 },
  { key: "phLevel", field: "phLevel", label: "pH do solo", icon: FlaskConical, decimals: 1 },
  { key: "lightLevel", field: "lightLevel", label: "Luminosidade", icon: Sun, unit: " lux", decimals: 0 },
];

function fmt(value: number, decimals: number): string {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export default async function DashboardPage() {
  const session = await auth();
  const firstName = (session!.user.name ?? "").split(" ")[0] || "produtor";
  const companyId = session!.user.companyId;

  if (!companyId) {
    return (
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="font-display text-2xl font-700">Olá, {firstName}</h1>
          <p className="text-sm text-muted">Resumo dos sensores e locais.</p>
        </header>
        <section className="rounded-2xl glass p-8 text-center text-sm text-muted">
          Sua conta ainda não está vinculada a uma empresa com dados. Assim que
          houver locais e sensores, o painel aparece aqui.
        </section>
      </div>
    );
  }

  // Contagens, lista de sensores e local representativo da empresa.
  const [sensorRows, locationRows, [company]] = await Promise.all([
    db.select({ id: sensors.id }).from(sensors).where(eq(sensors.companyId, companyId)),
    db
      .select({ name: locations.name, type: locations.type })
      .from(locations)
      .where(eq(locations.companyId, companyId))
      .orderBy(desc(locations.createdAt)),
    db
      .select({ name: companies.name, lat: companies.latitude, lng: companies.longitude })
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1),
  ]);

  const sensorIds = sensorRows.map((s) => s.id);
  const sensorCount = sensorIds.length;
  const locationCount = locationRows.length;
  const primaryLocation = locationRows[0]?.name ?? company?.name ?? "Sua operação";

  // Leituras das últimas 24 h para os sensores da empresa.
  const since = new Date(Date.now() - 24 * HOUR_MS);
  const recent = sensorIds.length
    ? await db
        .select({
          sensorId: readings.sensorId,
          soilMoisture: readings.soilMoisture,
          airTemperature: readings.airTemperature,
          airHumidity: readings.airHumidity,
          co2Level: readings.co2Level,
          phLevel: readings.phLevel,
          lightLevel: readings.lightLevel,
          ts: readings.ts,
        })
        .from(readings)
        .where(and(inArray(readings.sensorId, sensorIds), gte(readings.ts, since)))
        .orderBy(readings.ts)
    : [];

  // Última leitura por sensor → online/offline e valores atuais.
  const latest = new Map<string, (typeof recent)[number]>();
  for (const r of recent) latest.set(r.sensorId, r); // ordenado asc → fica a mais recente

  const now = Date.now();
  let online = 0;
  const moistures: number[] = [];
  for (const r of latest.values()) {
    if (now - new Date(r.ts).getTime() <= ONLINE_WINDOW_MS) online += 1;
    if (typeof r.soilMoisture === "number") moistures.push(r.soilMoisture);
  }
  const offline = Math.max(0, sensorCount - online);

  // Health score a partir da umidade do solo dos sensores.
  const health =
    moistures.length > 0
      ? Math.round(moistures.reduce((a, m) => a + moistureScore(m), 0) / moistures.length)
      : null;
  const healthStatus =
    health === null
      ? { label: "Sem leituras", tone: "info" as const }
      : health >= 80
        ? { label: "Saúde ótima", tone: "brand" as const }
        : health >= 55
          ? { label: "Atenção", tone: "warn" as const }
          : { label: "Crítico", tone: "danger" as const };

  // Valor atual (média das últimas leituras) e série horária por métrica.
  const hourly = new Map<number, Record<string, number[]>>();
  for (const r of recent) {
    const key = Math.floor(new Date(r.ts).getTime() / HOUR_MS);
    const b = hourly.get(key) ?? {};
    for (const m of METRICS) {
      const v = r[m.field];
      if (typeof v === "number") (b[m.field] ??= []).push(v);
    }
    hourly.set(key, b);
  }
  const hourKeys = [...hourly.keys()].sort((a, b) => a - b).slice(-24);
  const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);

  const metricCards = METRICS.map((m) => {
    const currentValues: number[] = [];
    for (const r of latest.values()) {
      const v = r[m.field];
      if (typeof v === "number") currentValues.push(v);
    }
    const current = avg(currentValues);
    const trend = hourKeys.map((k) => avg(hourly.get(k)?.[m.field] ?? []));
    const cls = classifyMetric(m.key, current);
    return {
      ...m,
      value: current === null ? "—" : fmt(current, m.decimals),
      status: cls.status,
      statusLabel: current === null ? "Sem dado" : cls.label,
      trend,
    };
  });

  // Alertas ativos = métricas fora da faixa ideal (atenção/crítico).
  const activeAlerts =
    metricCards.filter((c) => c.value !== "—" && c.status !== "ok").length;

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
  const irrigationLabel =
    irrigation === null
      ? "aguardando"
      : irrigation.urgency === "critical"
        ? "urgência alta"
        : irrigation.urgency === "medium"
          ? "urgência média"
          : "sem urgência";

  // Tendência geral (umidade do solo × temperatura do ar) por hora.
  const trend: TrendRow[] = hourKeys.map((k) => ({
    label: `${new Date(k * HOUR_MS).getHours().toString().padStart(2, "0")}h`,
    soilMoisture: avg(hourly.get(k)?.soilMoisture ?? []) === null ? null : Math.round(avg(hourly.get(k)!.soilMoisture)! * 10) / 10,
    airTemperature: avg(hourly.get(k)?.airTemperature ?? []) === null ? null : Math.round(avg(hourly.get(k)!.airTemperature)! * 10) / 10,
  }));

  const chipTone = (tone: "brand" | "warn" | "danger" | "info") =>
    tone === "brand"
      ? "bg-brand/10 text-brand"
      : tone === "warn"
        ? "bg-warn/10 text-warn"
        : tone === "danger"
          ? "bg-danger/10 text-danger"
          : "bg-info/10 text-info";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-700">Olá, {firstName}</h1>
          <p className="text-sm text-muted">
            {primaryLocation} · {locationCount} {locationCount === 1 ? "local" : "locais"} —{" "}
            <span className="inline-flex items-center gap-1 text-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" /> ao vivo
            </span>
          </p>
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

      {/* Painel de saúde + cards de sensor */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)]">
        {/* Saúde da estufa */}
        <div className="flex flex-col gap-4 rounded-2xl glass p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-600 uppercase tracking-wide text-muted">
              Saúde da estufa
            </span>
            <span className={`rounded-full px-2.5 py-1 text-xs font-600 ${chipTone(healthStatus.tone)}`}>
              {healthStatus.label}
            </span>
          </div>
          <div className="flex items-center justify-center py-1">
            <HealthGauge value={health} size={156} label="Índice geral" />
          </div>
          <div className="flex flex-col divide-y divide-black/5 text-sm dark:divide-white/10">
            <div className="flex items-center justify-between py-2.5">
              <span className="flex items-center gap-2 text-muted"><Wifi size={15} /> Sensores online</span>
              <span className="font-600">{online}/{sensorCount}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="flex items-center gap-2 text-muted"><WifiOff size={15} /> Offline</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-600 ${offline > 0 ? "bg-danger/10 text-danger" : "bg-brand/10 text-brand"}`}>
                {offline} {offline === 1 ? "nó" : "nós"}
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="flex items-center gap-2 text-muted"><Bell size={15} /> Alertas ativos</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-600 ${activeAlerts > 0 ? "bg-warn/10 text-warn" : "bg-brand/10 text-brand"}`}>
                {activeAlerts}
              </span>
            </div>
          </div>
          <div className="rounded-xl bg-black/[0.03] p-4 dark:bg-white/[0.04]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-600">
                <Droplet size={15} className="text-brand" /> Irrigação · decisão na borda
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-600 ${chipTone(irrigationTone)}`}>
                {irrigationLabel}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted">
              {irrigation === null
                ? "Regra local pronta — aguardando leituras."
                : `${irrigation.reasoning} · regra local`}
            </p>
          </div>
        </div>

        {/* Cards de sensor */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {metricCards.map((c) => (
            <SensorCard
              key={c.key}
              icon={c.icon}
              label={c.label}
              value={c.value}
              unit={c.value === "—" ? undefined : c.unit}
              status={c.status}
              statusLabel={c.statusLabel}
              trend={c.trend}
            />
          ))}
        </div>
      </section>

      {/* Frota */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard icon={Cpu} label="Sensores" value={sensorCount} hint="instalados" />
        <KpiCard icon={Wifi} label="Online" value={online} status="ativos" tone="brand" />
        <KpiCard icon={WifiOff} label="Offline" value={offline} tone={offline > 0 ? "danger" : "brand"} hint="sem leitura recente" />
        <KpiCard icon={MapPinned} label="Locais" value={locationCount} hint="monitorados" />
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
