import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { actuators, deviceCommands } from "@/db/schema";
import { authenticateDevice, touchDevice } from "@/lib/device-auth";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const ackSchema = z.object({
  status: z.enum(["acked", "failed"]),
  detail: z.string().max(500).optional(),
});

/**
 * POST /api/device/commands/:id/ack — firmware confirma (ou reporta falha
 * de) execução de um comando. Em sucesso, o estado do atuador é refletido
 * no banco a partir do payload original do comando.
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateDevice(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const { token, device } = auth;

  const rl = rateLimit(`device-ack:${token.prefix}`, 120, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: "invalid_command_id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = ackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  // O comando precisa pertencer a este device e estar aguardando ack.
  const [cmd] = await db
    .select()
    .from(deviceCommands)
    .where(
      and(eq(deviceCommands.id, id), eq(deviceCommands.deviceId, device.id)),
    )
    .limit(1);
  if (!cmd) {
    return NextResponse.json({ error: "command_not_found" }, { status: 404 });
  }
  if (cmd.status !== "sent" && cmd.status !== "pending") {
    return NextResponse.json({ error: "command_not_ackable" }, { status: 409 });
  }

  const now = new Date();
  await db
    .update(deviceCommands)
    .set({
      status: parsed.data.status,
      ackedAt: now,
      detail: parsed.data.detail ?? null,
    })
    .where(eq(deviceCommands.id, cmd.id));

  // Sucesso → refletir o novo estado do atuador.
  if (parsed.data.status === "acked" && cmd.actuatorId) {
    const c = cmd.command as { command?: string; level?: number };
    const patch: Partial<typeof actuators.$inferInsert> = {
      stateUpdatedAt: now,
    };
    if (c.command === "on") patch.isOn = true;
    if (c.command === "off") patch.isOn = false;
    if (c.command === "set_level" && typeof c.level === "number") {
      patch.level = Math.max(0, Math.min(100, Math.round(c.level)));
      patch.isOn = patch.level > 0;
    }
    await db
      .update(actuators)
      .set(patch)
      .where(eq(actuators.id, cmd.actuatorId));
  }

  await touchDevice(token, device);
  return NextResponse.json({ ok: true });
}
