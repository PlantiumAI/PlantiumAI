"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { actuators, automationRules } from "@/db/schema";
import { actionSchema, triggerSchema } from "@/lib/automation";
import { requireCompany } from "@/lib/session";

const PATH = "/app/automacoes";

export type RuleFormState = { error?: string; ok?: boolean };

const formSchema = z.object({
  name: z.string().min(2).max(120),
  locationId: z.string().uuid().optional(),
  cooldownS: z.coerce.number().int().min(0).max(86400).default(300),
  triggerKind: z.enum(["sensor", "schedule"]),
  // sensor
  metric: z.string().optional(),
  op: z.string().optional(),
  value: z.coerce.number().optional(),
  // schedule
  time: z.string().optional(),
  // action
  actuatorId: z.string().uuid(),
  command: z.enum(["on", "off", "set_level"]),
  level: z.coerce.number().int().min(0).max(100).optional(),
  durationS: z.coerce.number().int().min(1).max(3600).optional(),
});

export async function createRule(
  _prev: RuleFormState,
  formData: FormData,
): Promise<RuleFormState> {
  const s = await requireCompany();
  if ("error" in s) return { error: s.error };

  const raw = formSchema.safeParse({
    name: formData.get("name"),
    locationId: formData.get("locationId") || undefined,
    cooldownS: formData.get("cooldownS") || 300,
    triggerKind: formData.get("triggerKind"),
    metric: formData.get("metric") || undefined,
    op: formData.get("op") || undefined,
    value: formData.get("value") || undefined,
    time: formData.get("time") || undefined,
    actuatorId: formData.get("actuatorId"),
    command: formData.get("command"),
    level: formData.get("level") || undefined,
    durationS: formData.get("durationS") || undefined,
  });
  if (!raw.success) return { error: "Dados da regra inválidos." };
  const f = raw.data;

  // Monta e valida trigger/action com os schemas canônicos do motor.
  const trigger = triggerSchema.safeParse(
    f.triggerKind === "sensor"
      ? { kind: "sensor", metric: f.metric, op: f.op, value: f.value }
      : { kind: "schedule", time: f.time },
  );
  if (!trigger.success) {
    return {
      error:
        f.triggerKind === "sensor"
          ? "Condição do sensor incompleta (métrica, operador e valor)."
          : "Horário inválido (use HH:MM).",
    };
  }

  const action = actionSchema.safeParse({
    actuatorId: f.actuatorId,
    command: f.command,
    ...(f.level !== undefined ? { level: f.level } : {}),
    ...(f.durationS !== undefined ? { durationS: f.durationS } : {}),
  });
  if (!action.success) return { error: "Ação inválida." };

  // Atuador precisa ser da empresa.
  const [act] = await db
    .select({ id: actuators.id })
    .from(actuators)
    .where(
      and(
        eq(actuators.id, action.data.actuatorId),
        eq(actuators.companyId, s.companyId),
      ),
    )
    .limit(1);
  if (!act) return { error: "Atuador não encontrado." };

  await db.insert(automationRules).values({
    companyId: s.companyId,
    locationId: f.locationId ?? null,
    name: f.name,
    trigger: trigger.data,
    action: action.data,
    cooldownS: f.cooldownS,
  });

  revalidatePath(PATH);
  return { ok: true };
}

export async function toggleRule(formData: FormData): Promise<void> {
  const s = await requireCompany();
  if ("error" in s) return;
  const id = String(formData.get("id") ?? "");
  if (!z.string().uuid().safeParse(id).success) return;

  const [rule] = await db
    .select({ enabled: automationRules.enabled })
    .from(automationRules)
    .where(
      and(eq(automationRules.id, id), eq(automationRules.companyId, s.companyId)),
    )
    .limit(1);
  if (!rule) return;

  await db
    .update(automationRules)
    .set({ enabled: !rule.enabled })
    .where(eq(automationRules.id, id));
  revalidatePath(PATH);
}

export async function deleteRule(formData: FormData): Promise<void> {
  const s = await requireCompany();
  if ("error" in s) return;
  const id = String(formData.get("id") ?? "");
  if (!z.string().uuid().safeParse(id).success) return;
  await db
    .delete(automationRules)
    .where(
      and(eq(automationRules.id, id), eq(automationRules.companyId, s.companyId)),
    );
  revalidatePath(PATH);
}
