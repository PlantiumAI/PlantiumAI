import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { deviceTokens, readings, sensors } from "@/db/schema";
import { parsePrefix, verifyDeviceToken } from "@/lib/device-token";
import { isInRange, type Metric } from "@/lib/sensor-rules";
import { clientKey, rateLimit } from "@/lib/rate-limit";

// Roda no runtime Node (crypto/HMAC + driver Neon).
export const runtime = "nodejs";

const payloadSchema = z.object({
  sensorId: z.string().uuid(),
  soil_moisture: z.number().nullish(),
  air_temperature: z.number().nullish(),
  air_humidity: z.number().nullish(),
  light_level: z.number().nullish(),
  soil_temperature: z.number().nullish(),
  co2_level: z.number().nullish(),
  ph_level: z.number().nullish(),
});

// Mapeia campos do payload → métricas validáveis.
const metricMap: Record<string, Metric> = {
  soil_moisture: "soilMoisture",
  air_temperature: "airTemperature",
  air_humidity: "airHumidity",
  light_level: "lightLevel",
  soil_temperature: "soilTemperature",
  co2_level: "co2Level",
  ph_level: "phLevel",
};

export async function POST(req: Request) {
  // Rate limit por IP (anti-abuso).
  const rl = rateLimit(clientKey(req, "ingest"), 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  // Token via header Authorization: Bearer plt_...
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const prefix = parsePrefix(token);
  if (!prefix) {
    return NextResponse.json({ error: "missing_token" }, { status: 401 });
  }

  const [dt] = await db
    .select()
    .from(deviceTokens)
    .where(eq(deviceTokens.prefix, prefix))
    .limit(1);

  if (!dt || dt.revoked || !verifyDeviceToken(token, dt.tokenHash)) {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  // Valida corpo
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
  const data = parsed.data;

  // O sensor deve pertencer à mesma empresa do token.
  const [sensor] = await db
    .select({ id: sensors.id })
    .from(sensors)
    .where(and(eq(sensors.id, data.sensorId), eq(sensors.companyId, dt.companyId)))
    .limit(1);
  if (!sensor) {
    return NextResponse.json({ error: "sensor_not_found" }, { status: 404 });
  }

  // Descarta valores fora da faixa física (mantém o resto).
  const clean: Record<string, number | null> = {};
  const raw = data as Record<string, unknown>;
  for (const [field, metric] of Object.entries(metricMap)) {
    const v = raw[field];
    clean[field] = typeof v === "number" && isInRange(metric, v) ? v : null;
  }

  await db.insert(readings).values({
    sensorId: sensor.id,
    soilMoisture: clean.soil_moisture,
    airTemperature: clean.air_temperature,
    airHumidity: clean.air_humidity,
    lightLevel: clean.light_level,
    soilTemperature: clean.soil_temperature,
    co2Level: clean.co2_level,
    phLevel: clean.ph_level,
    source: "firmware",
  });

  await db
    .update(deviceTokens)
    .set({ lastUsedAt: new Date() })
    .where(eq(deviceTokens.id, dt.id));

  return NextResponse.json({ ok: true });
}
