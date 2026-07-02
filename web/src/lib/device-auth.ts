import { eq } from "drizzle-orm";
import { db } from "@/db";
import { devices, deviceTokens, type Device, type DeviceToken } from "@/db/schema";
import { parsePrefix, verifyDeviceToken } from "@/lib/device-token";

/**
 * Autentica um request de firmware nas rotas /api/device/*.
 * Exige `Authorization: Bearer plt_...` de um token não revogado e
 * vinculado a um device (tokens legados sem device usam /api/ingest).
 */
export type DeviceAuth =
  | { ok: true; token: DeviceToken; device: Device }
  | { ok: false; status: number; error: string };

export async function authenticateDevice(req: Request): Promise<DeviceAuth> {
  const auth = req.headers.get("authorization") ?? "";
  const raw = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const prefix = parsePrefix(raw);
  if (!prefix) return { ok: false, status: 401, error: "missing_token" };

  const [dt] = await db
    .select()
    .from(deviceTokens)
    .where(eq(deviceTokens.prefix, prefix))
    .limit(1);

  if (!dt || dt.revoked || !verifyDeviceToken(raw, dt.tokenHash)) {
    return { ok: false, status: 401, error: "invalid_token" };
  }
  if (!dt.deviceId) {
    return { ok: false, status: 403, error: "token_not_linked_to_device" };
  }

  const [device] = await db
    .select()
    .from(devices)
    .where(eq(devices.id, dt.deviceId))
    .limit(1);
  if (!device) return { ok: false, status: 403, error: "device_not_found" };

  return { ok: true, token: dt, device };
}

/** Marca o device como online e atualiza o last_seen + last_used do token. */
export async function touchDevice(token: DeviceToken, device: Device): Promise<void> {
  const now = new Date();
  await Promise.all([
    db
      .update(devices)
      .set({ status: "online", lastSeenAt: now })
      .where(eq(devices.id, device.id)),
    db
      .update(deviceTokens)
      .set({ lastUsedAt: now })
      .where(eq(deviceTokens.id, token.id)),
  ]);
}
