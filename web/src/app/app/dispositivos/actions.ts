"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import {
  actuators,
  deviceCommands,
  devices,
  deviceTokens,
  locations,
} from "@/db/schema";
import { generateDeviceToken } from "@/lib/device-token";
import { requireCompany } from "@/lib/session";

const PATH = "/app/dispositivos";

// ── Dispositivos ─────────────────────────────────────────────

const deviceSchema = z.object({
  name: z.string().min(2).max(120),
  model: z.enum(["esp32", "esp32cam", "gateway"]),
  locationId: z.string().uuid().optional(),
});

export type FormState = { error?: string; ok?: boolean };

export async function createDevice(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const s = await requireCompany();
  if ("error" in s) return { error: s.error };

  const parsed = deviceSchema.safeParse({
    name: formData.get("name"),
    model: formData.get("model"),
    locationId: formData.get("locationId") || undefined,
  });
  if (!parsed.success) return { error: "Dados do dispositivo inválidos." };

  // Local (estufa) precisa ser da mesma empresa.
  if (parsed.data.locationId) {
    const [loc] = await db
      .select({ id: locations.id })
      .from(locations)
      .where(
        and(
          eq(locations.id, parsed.data.locationId),
          eq(locations.companyId, s.companyId),
        ),
      )
      .limit(1);
    if (!loc) return { error: "Local não encontrado." };
  }

  await db.insert(devices).values({
    companyId: s.companyId,
    locationId: parsed.data.locationId ?? null,
    name: parsed.data.name,
    model: parsed.data.model,
  });

  revalidatePath(PATH);
  return { ok: true };
}

export async function deleteDevice(formData: FormData): Promise<void> {
  const s = await requireCompany();
  if ("error" in s) return;
  const id = String(formData.get("id") ?? "");
  if (!z.string().uuid().safeParse(id).success) return;
  await db
    .delete(devices)
    .where(and(eq(devices.id, id), eq(devices.companyId, s.companyId)));
  revalidatePath(PATH);
}

// ── Token vinculado ao device (mostrado UMA vez) ─────────────

export type TokenState = { token?: string; error?: string };

export async function createDeviceLinkedToken(
  _prev: TokenState,
  formData: FormData,
): Promise<TokenState> {
  const s = await requireCompany();
  if ("error" in s) return { error: s.error };

  const deviceId = String(formData.get("deviceId") ?? "");
  const [dev] = await db
    .select({ id: devices.id, name: devices.name })
    .from(devices)
    .where(and(eq(devices.id, deviceId), eq(devices.companyId, s.companyId)))
    .limit(1);
  if (!dev) return { error: "Dispositivo não encontrado." };

  // Um token ativo por device: revoga os anteriores antes de emitir.
  await db
    .update(deviceTokens)
    .set({ revoked: true })
    .where(
      and(eq(deviceTokens.deviceId, dev.id), eq(deviceTokens.revoked, false)),
    );

  const { token, prefix, tokenHash } = generateDeviceToken();
  await db.insert(deviceTokens).values({
    companyId: s.companyId,
    deviceId: dev.id,
    prefix,
    tokenHash,
    label: `Device: ${dev.name}`,
  });

  revalidatePath(PATH);
  revalidatePath("/app/tokens");
  return { token };
}

// ── Atuadores ────────────────────────────────────────────────

const actuatorSchema = z.object({
  deviceId: z.string().uuid(),
  name: z.string().min(2).max(120),
  type: z.enum(["pump", "valve", "fan", "exhaust", "led_panel", "relay", "heater"]),
  channel: z.coerce.number().int().min(0).max(64),
});

export async function createActuator(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const s = await requireCompany();
  if ("error" in s) return { error: s.error };

  const parsed = actuatorSchema.safeParse({
    deviceId: formData.get("deviceId"),
    name: formData.get("name"),
    type: formData.get("type"),
    channel: formData.get("channel") ?? 0,
  });
  if (!parsed.success) return { error: "Dados do atuador inválidos." };

  const [dev] = await db
    .select({ id: devices.id, locationId: devices.locationId })
    .from(devices)
    .where(
      and(
        eq(devices.id, parsed.data.deviceId),
        eq(devices.companyId, s.companyId),
      ),
    )
    .limit(1);
  if (!dev) return { error: "Dispositivo não encontrado." };

  await db.insert(actuators).values({
    companyId: s.companyId,
    locationId: dev.locationId,
    deviceId: dev.id,
    name: parsed.data.name,
    type: parsed.data.type,
    channel: parsed.data.channel,
  });

  revalidatePath(PATH);
  return { ok: true };
}

export async function deleteActuator(formData: FormData): Promise<void> {
  const s = await requireCompany();
  if ("error" in s) return;
  const id = String(formData.get("id") ?? "");
  if (!z.string().uuid().safeParse(id).success) return;
  await db
    .delete(actuators)
    .where(and(eq(actuators.id, id), eq(actuators.companyId, s.companyId)));
  revalidatePath(PATH);
}

// ── Comando manual (liga/desliga/nível) ──────────────────────

const COMMAND_TTL_MS = 5 * 60_000; // não coletado em 5 min → expira

const commandSchema = z.object({
  actuatorId: z.string().uuid(),
  command: z.enum(["on", "off", "set_level"]),
  level: z.coerce.number().int().min(0).max(100).optional(),
  durationS: z.coerce.number().int().min(1).max(3600).optional(),
});

export async function sendCommand(formData: FormData): Promise<void> {
  const s = await requireCompany();
  if ("error" in s) return;

  const parsed = commandSchema.safeParse({
    actuatorId: formData.get("actuatorId"),
    command: formData.get("command"),
    level: formData.get("level") || undefined,
    durationS: formData.get("durationS") || undefined,
  });
  if (!parsed.success) return;

  const [act] = await db
    .select({ id: actuators.id, deviceId: actuators.deviceId })
    .from(actuators)
    .where(
      and(
        eq(actuators.id, parsed.data.actuatorId),
        eq(actuators.companyId, s.companyId),
      ),
    )
    .limit(1);
  if (!act) return;

  await db.insert(deviceCommands).values({
    deviceId: act.deviceId,
    actuatorId: act.id,
    command: {
      command: parsed.data.command,
      ...(parsed.data.level !== undefined ? { level: parsed.data.level } : {}),
      ...(parsed.data.durationS !== undefined
        ? { durationS: parsed.data.durationS }
        : {}),
    },
    issuedBy: "user",
    expiresAt: new Date(Date.now() + COMMAND_TTL_MS),
  });

  revalidatePath(PATH);
}
