import { NextResponse } from "next/server";
import { and, eq, inArray, lt } from "drizzle-orm";
import { db } from "@/db";
import { deviceCommands } from "@/db/schema";
import { authenticateDevice, touchDevice } from "@/lib/device-auth";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * GET /api/device/commands — o device coleta comandos pendentes.
 * Comandos retornados são marcados `sent`; o firmware confirma execução
 * em POST /api/device/commands/:id/ack.
 */
export async function GET(req: Request) {
  const auth = await authenticateDevice(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { token, device } = auth;

  const rl = rateLimit(`device-commands:${token.prefix}`, 120, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const now = new Date();
  // Expira o que passou do prazo antes de entregar.
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

  const pending = await db
    .select({
      id: deviceCommands.id,
      actuatorId: deviceCommands.actuatorId,
      command: deviceCommands.command,
      createdAt: deviceCommands.createdAt,
    })
    .from(deviceCommands)
    .where(
      and(
        eq(deviceCommands.deviceId, device.id),
        eq(deviceCommands.status, "pending"),
      ),
    )
    .limit(20);

  if (pending.length > 0) {
    await db
      .update(deviceCommands)
      .set({ status: "sent", sentAt: now })
      .where(
        inArray(
          deviceCommands.id,
          pending.map((c) => c.id),
        ),
      );
  }

  await touchDevice(token, device);

  return NextResponse.json({
    ok: true,
    commands: pending.map((c) => ({
      id: c.id,
      actuator_id: c.actuatorId,
      command: c.command,
      created_at: c.createdAt,
    })),
  });
}
