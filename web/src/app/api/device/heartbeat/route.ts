import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { devices } from "@/db/schema";
import { authenticateDevice, touchDevice } from "@/lib/device-auth";
import { rateLimit } from "@/lib/rate-limit";
import { evaluateScheduleRules } from "@/lib/automation";

export const runtime = "nodejs";

const heartbeatSchema = z.object({
  v: z.literal(1).optional(),
  firmware_version: z.string().max(40).optional(),
  rssi: z.number().optional(),
  uptime_s: z.number().optional(),
});

/**
 * POST /api/device/heartbeat — sinal de vida do firmware (sem telemetria).
 * Mantém o status online e registra a versão de firmware em execução.
 */
export async function POST(req: Request) {
  const auth = await authenticateDevice(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { token, device } = auth;

  const rl = rateLimit(`device-heartbeat:${token.prefix}`, 60, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    // corpo vazio é aceitável para heartbeat
  }
  const parsed = heartbeatSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  if (parsed.data.firmware_version) {
    await db
      .update(devices)
      .set({ firmwareVersion: parsed.data.firmware_version })
      .where(eq(devices.id, device.id));
  }
  await touchDevice(token, device);

  // Heartbeat também dispara regras de horário vencidas (sem cron pago).
  try {
    await evaluateScheduleRules(device.companyId);
  } catch (err) {
    console.error("automation: falha nas regras de horário", err);
  }

  return NextResponse.json({ ok: true, config: device.config ?? null });
}
