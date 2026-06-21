"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { sensors } from "@/db/schema";
import { requireCompany } from "@/lib/session";

export type SensorFormState = { error?: string; ok?: boolean };

const SENSOR_TYPES = [
  "estacao_completa",
  "soil_moisture",
  "soil_temperature",
  "air_temperature",
  "air_humidity",
  "light_level",
  "co2_level",
  "ph_level",
] as const;

const schema = z.object({
  name: z.string().min(2, "Informe o nome do sensor."),
  type: z.enum(SENSOR_TYPES),
  locationId: z.string().uuid().nullable(),
  deviceTokenId: z.string().uuid().nullable(),
});

function read(formData: FormData) {
  const opt = (k: string) => {
    const v = formData.get(k);
    return v && String(v).length > 0 ? String(v) : null;
  };
  return schema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    locationId: opt("locationId"),
    deviceTokenId: opt("deviceTokenId"),
  });
}

export async function createSensor(
  _prev: SensorFormState,
  formData: FormData,
): Promise<SensorFormState> {
  const ctx = await requireCompany();
  if ("error" in ctx) return { error: ctx.error };

  const parsed = read(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  await db.insert(sensors).values({ ...parsed.data, companyId: ctx.companyId });
  revalidatePath("/app/sensores");
  return { ok: true };
}

export async function updateSensor(
  _prev: SensorFormState,
  formData: FormData,
): Promise<SensorFormState> {
  const ctx = await requireCompany();
  if ("error" in ctx) return { error: ctx.error };

  const id = String(formData.get("id") ?? "");
  const parsed = read(formData);
  if (!id || !parsed.success) {
    return { error: parsed.error?.issues[0]?.message ?? "Dados inválidos." };
  }

  await db
    .update(sensors)
    .set(parsed.data)
    .where(and(eq(sensors.id, id), eq(sensors.companyId, ctx.companyId)));
  revalidatePath("/app/sensores");
  redirect("/app/sensores");
}

export async function deleteSensor(formData: FormData): Promise<void> {
  const ctx = await requireCompany();
  if ("error" in ctx) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db
    .delete(sensors)
    .where(and(eq(sensors.id, id), eq(sensors.companyId, ctx.companyId)));
  revalidatePath("/app/sensores");
}
