import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { ArrowLeft, Pencil } from "lucide-react";
import { auth } from "@/auth";
import { db } from "@/db";
import { locations, readings, sensors } from "@/db/schema";
import { SensorCharts } from "@/components/sensor-charts";
import {
  SENSOR_TYPE_META,
  type MetricKey,
  type SensorTypeKey,
} from "@/lib/sensor-types";

// Mapeia coluna do banco → chave de métrica do catálogo.
const COLS: Record<MetricKey, keyof typeof readings.$inferSelect> = {
  soilMoisture: "soilMoisture",
  airTemperature: "airTemperature",
  airHumidity: "airHumidity",
  lightLevel: "lightLevel",
  soilTemperature: "soilTemperature",
  co2Level: "co2Level",
  phLevel: "phLevel",
};

export default async function SensorDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const companyId = session!.user.companyId;
  if (!companyId) notFound();

  const [sensor] = await db
    .select({
      id: sensors.id,
      name: sensors.name,
      type: sensors.type,
      active: sensors.active,
      location: locations.name,
    })
    .from(sensors)
    .leftJoin(locations, eq(sensors.locationId, locations.id))
    .where(and(eq(sensors.id, id), eq(sensors.companyId, companyId)))
    .limit(1);

  if (!sensor) notFound();

  const meta = SENSOR_TYPE_META[sensor.type as SensorTypeKey];
  const metrics = meta?.metrics ?? [];

  // Últimas 300 leituras em ordem cronológica para os gráficos.
  const rows = await db
    .select()
    .from(readings)
    .where(eq(readings.sensorId, id))
    .orderBy(asc(readings.ts))
    .limit(300);

  const data = rows.map((r) => {
    const point: Record<string, string | number | null> = {
      label: r.ts.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    for (const key of metrics) point[key] = r[COLS[key]] as number | null;
    return point as { label: string } & Partial<Record<MetricKey, number | null>>;
  });

  return (
    <div className="flex flex-col gap-6">
      <Link href="/app/sensores" className="flex w-fit items-center gap-1.5 text-sm text-muted hover:text-brand">
        <ArrowLeft size={16} /> Sensores
      </Link>

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-700">{sensor.name}</h1>
          <p className="text-sm text-muted">
            {meta?.label ?? sensor.type}
            {sensor.location ? ` · ${sensor.location}` : ""}
            {" · "}
            {sensor.active ? "ativo" : "inativo"}
          </p>
        </div>
        <Link
          href={`/app/sensores/${sensor.id}/editar`}
          className="flex items-center gap-1.5 rounded-xl glass px-4 py-2 text-sm font-600 transition hover:scale-[1.02]"
        >
          <Pencil size={15} /> Editar
        </Link>
      </header>

      <SensorCharts metrics={metrics} data={data} />
    </div>
  );
}
