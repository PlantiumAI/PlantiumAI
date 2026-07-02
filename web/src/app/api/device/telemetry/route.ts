import { NextResponse } from "next/server";
import { and, count, eq, lt } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { alerts, deviceCommands, readings, sensors } from "@/db/schema";
import { authenticateDevice, touchDevice } from "@/lib/device-auth";
import { classifyMetric, isInRange, type Metric } from "@/lib/sensor-rules";
import { rateLimit } from "@/lib/rate-limit";

// Runtime Node (crypto/HMAC + driver Neon).
export const runtime = "nodejs";

/**
 * POST /api/device/telemetry — lote de leituras do firmware.
 * Payload: { v:1, readings:[{ sensor_id?, ts?, air_temperature, ... }] }
 * `sensor_id` pode ser omitido quando o device tem um único sensor ativo.
 * Resposta inclui `commands_pending` para o device saber se deve buscar comandos.
 */

const readingSchema = z.object({
  sensor_id: z.string().uuid().optional(),
  ts: z.coerce.date().optional(),
  soil_moisture: z.number().nullish(),
  air_temperature: z.number().nullish(),
  air_humidity: z.number().nullish(),
  light_level: z.number().nullish(),
  soil_temperature: z.number().nullish(),
  co2_level: z.number().nullish(),
  ph_level: z.number().nullish(),
});

const payloadSchema = z.object({
  v: z.literal(1).optional(),
  readings: z.array(readingSchema).min(1).max(50),
});

// payload snake_case → métrica camelCase (colunas de readings)
const METRICS: Array<[keyof z.infer<typeof readingSchema>, Metric]> = [
  ["soil_moisture", "soilMoisture"],
  ["air_temperature", "airTemperature"],
  ["air_humidity", "airHumidity"],
  ["light_level", "lightLevel"],
  ["soil_temperature", "soilTemperature"],
  ["co2_level", "co2Level"],
  ["ph_level", "phLevel"],
];

export async function POST(req: Request) {
  const auth = await authenticateDevice(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { token, device } = auth;

  const rl = rateLimit(`device-telemetry:${token.prefix}`, 120, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  // Sensores válidos deste device (escopo de segurança: mesma empresa).
  const deviceSensors = await db
    .select({ id: sensors.id, locationId: sensors.locationId })
    .from(sensors)
    .where(
      and(
        eq(sensors.companyId, device.companyId),
        eq(sensors.deviceId, device.id),
        eq(sensors.active, true),
      ),
    );
  const sensorIds = new Set(deviceSensors.map((s) => s.id));
  const defaultSensor = deviceSensors.length === 1 ? deviceSensors[0] : null;

  const rows: (typeof readings.$inferInsert)[] = [];
  const alertCandidates: Array<{
    sensorId: string;
    locationId: string | null;
    metric: string;
    value: number;
  }> = [];
  let rejected = 0;

  for (const r of parsed.data.readings) {
    const sensorId = r.sensor_id ?? defaultSensor?.id;
    if (!sensorId || !sensorIds.has(sensorId)) {
      rejected += 1;
      continue;
    }
    const row: Record<string, unknown> = {
      sensorId,
      source: "device",
      ...(r.ts ? { ts: r.ts } : {}),
    };
    for (const [field, metric] of METRICS) {
      const v = r[field];
      const valid = typeof v === "number" && isInRange(metric, v);
      row[metric] = valid ? v : null;
      // Valor fisicamente válido porém crítico → candidato a alerta.
      if (valid && classifyMetric(metric, v as number).status === "bad") {
        alertCandidates.push({
          sensorId,
          locationId:
            deviceSensors.find((s) => s.id === sensorId)?.locationId ?? null,
          metric: field,
          value: v as number,
        });
      }
    }
    rows.push(row as typeof readings.$inferInsert);
  }

  if (rows.length > 0) {
    await db.insert(readings).values(rows);
  }

  // Alertas críticos: no máximo 1 aberto por sensor+métrica (anti-spam).
  for (const c of alertCandidates) {
    const [open] = await db
      .select({ id: alerts.id })
      .from(alerts)
      .where(
        and(
          eq(alerts.sensorId, c.sensorId),
          eq(alerts.metric, c.metric),
          eq(alerts.resolved, false),
        ),
      )
      .limit(1);
    if (!open) {
      await db.insert(alerts).values({
        companyId: device.companyId,
        locationId: c.locationId,
        sensorId: c.sensorId,
        severity: "critico",
        metric: c.metric,
        value: c.value,
        message: `Valor crítico de ${c.metric}: ${c.value}`,
      });
    }
  }

  await touchDevice(token, device);

  // Expira comandos não coletados e informa quantos aguardam o device.
  const now = new Date();
  await db
    .update(deviceCommands)
    .set({ status: "expired" })
    .where(
      and(
        eq(deviceCommands.deviceId, device.id),
        eq(deviceCommands.status, "pending"),
        lt(deviceCommands.expiresAt, now),
      ),
    );
  const [pending] = await db
    .select({ n: count() })
    .from(deviceCommands)
    .where(
      and(
        eq(deviceCommands.deviceId, device.id),
        eq(deviceCommands.status, "pending"),
      ),
    );

  return NextResponse.json({
    ok: true,
    accepted: rows.length,
    rejected,
    commands_pending: pending?.n ?? 0,
  });
}
