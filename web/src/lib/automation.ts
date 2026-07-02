import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { actuators, automationRules, deviceCommands } from "@/db/schema";

/**
 * Motor de automação (Fase 3 do plano produto-real).
 *
 * Regras (`automation_rules`) têm trigger/action em jsonb:
 *  - trigger sensor:  { kind:"sensor", metric:"soil_moisture", op:"lt", value:30 }
 *  - trigger horário: { kind:"schedule", time:"06:00" }  (hora local America/Sao_Paulo)
 *  - action:          { actuatorId, command:"on"|"off"|"set_level", level?, durationS? }
 *
 * Avaliação:
 *  - Gatilhos de sensor rodam a cada telemetria recebida (orientado a evento).
 *  - Gatilhos de horário rodam a cada contato de QUALQUER device da empresa
 *    (telemetria/heartbeat) — dispensa cron pago; um cron externo pode chamar
 *    /api/cron/automations como reforço.
 *  - `cooldown_s` impede oscilação (liga/desliga em sequência).
 *  - IA nunca participa deste loop (decisão de arquitetura).
 */

export const sensorTriggerSchema = z.object({
  kind: z.literal("sensor"),
  metric: z.enum([
    "soil_moisture",
    "air_temperature",
    "air_humidity",
    "light_level",
    "soil_temperature",
    "co2_level",
    "ph_level",
  ]),
  op: z.enum(["lt", "lte", "gt", "gte"]),
  value: z.number(),
});

export const scheduleTriggerSchema = z.object({
  kind: z.literal("schedule"),
  /** "HH:MM" na hora local America/Sao_Paulo */
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
});

export const triggerSchema = z.discriminatedUnion("kind", [
  sensorTriggerSchema,
  scheduleTriggerSchema,
]);

export const actionSchema = z.object({
  actuatorId: z.string().uuid(),
  command: z.enum(["on", "off", "set_level"]),
  level: z.number().int().min(0).max(100).optional(),
  durationS: z.number().int().min(1).max(3600).optional(),
});

export type RuleTrigger = z.infer<typeof triggerSchema>;
export type RuleAction = z.infer<typeof actionSchema>;

const COMMAND_TTL_MS = 5 * 60_000;

const OPS: Record<string, (a: number, b: number) => boolean> = {
  lt: (a, b) => a < b,
  lte: (a, b) => a <= b,
  gt: (a, b) => a > b,
  gte: (a, b) => a >= b,
};

/** Hora local "HH:MM" em America/Sao_Paulo. */
function nowSaoPauloHHMM(now: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
}

/** Última meia-noite de São Paulo em UTC (para saber se a regra já disparou hoje). */
function lastMidnightSaoPaulo(now: Date): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  // meia-noite SP = 03:00 UTC (BRT, sem horário de verão desde 2019)
  return new Date(`${parts}T03:00:00.000Z`);
}

async function enqueueRuleCommand(
  rule: { id: string; companyId: string },
  action: RuleAction,
  now: Date,
): Promise<boolean> {
  // Atuador precisa ser da mesma empresa da regra.
  const [act] = await db
    .select({ id: actuators.id, deviceId: actuators.deviceId })
    .from(actuators)
    .where(
      and(
        eq(actuators.id, action.actuatorId),
        eq(actuators.companyId, rule.companyId),
        eq(actuators.active, true),
      ),
    )
    .limit(1);
  if (!act) return false;

  // Evita duplicar: se já há comando pendente desta regra p/ este atuador, pula.
  const [dup] = await db
    .select({ id: deviceCommands.id })
    .from(deviceCommands)
    .where(
      and(
        eq(deviceCommands.ruleId, rule.id),
        eq(deviceCommands.actuatorId, act.id),
        inArray(deviceCommands.status, ["pending", "sent"]),
      ),
    )
    .limit(1);
  if (dup) return false;

  await db.insert(deviceCommands).values({
    deviceId: act.deviceId,
    actuatorId: act.id,
    command: {
      command: action.command,
      ...(action.level !== undefined ? { level: action.level } : {}),
      ...(action.durationS !== undefined ? { durationS: action.durationS } : {}),
    },
    issuedBy: "automation",
    ruleId: rule.id,
    expiresAt: new Date(now.getTime() + COMMAND_TTL_MS),
  });
  await db
    .update(automationRules)
    .set({ lastFiredAt: now })
    .where(eq(automationRules.id, rule.id));
  return true;
}

/**
 * Avalia regras de SENSOR para uma empresa após telemetria.
 * `metrics` usa as chaves snake_case do payload (soil_moisture, ...).
 * `locationId` restringe regras por local (regra sem local vale p/ todos).
 */
export async function evaluateSensorRules(
  companyId: string,
  locationId: string | null,
  metrics: Record<string, number>,
): Promise<number> {
  const rules = await db
    .select()
    .from(automationRules)
    .where(
      and(
        eq(automationRules.companyId, companyId),
        eq(automationRules.enabled, true),
      ),
    );

  const now = new Date();
  let fired = 0;

  for (const rule of rules) {
    if (rule.locationId && rule.locationId !== locationId) continue;

    const trig = triggerSchema.safeParse(rule.trigger);
    const act = actionSchema.safeParse(rule.action);
    if (!trig.success || !act.success || trig.data.kind !== "sensor") continue;

    const reading = metrics[trig.data.metric];
    if (typeof reading !== "number") continue;
    if (!OPS[trig.data.op](reading, trig.data.value)) continue;

    // Cooldown anti-oscilação.
    if (
      rule.lastFiredAt &&
      now.getTime() - rule.lastFiredAt.getTime() < rule.cooldownS * 1000
    ) {
      continue;
    }

    if (await enqueueRuleCommand(rule, act.data, now)) fired += 1;
  }
  return fired;
}

/**
 * Avalia regras de HORÁRIO da empresa: dispara quando a hora local já passou
 * do agendado e a regra ainda não disparou hoje. Chamada em cada contato de
 * device (telemetria/heartbeat) e pela rota de cron externa.
 */
export async function evaluateScheduleRules(companyId: string): Promise<number> {
  const rules = await db
    .select()
    .from(automationRules)
    .where(
      and(
        eq(automationRules.companyId, companyId),
        eq(automationRules.enabled, true),
      ),
    );

  const now = new Date();
  const hhmm = nowSaoPauloHHMM(now);
  const midnight = lastMidnightSaoPaulo(now);
  let fired = 0;

  for (const rule of rules) {
    const trig = triggerSchema.safeParse(rule.trigger);
    const act = actionSchema.safeParse(rule.action);
    if (!trig.success || !act.success || trig.data.kind !== "schedule") continue;

    // Ainda não chegou a hora de hoje.
    if (hhmm < trig.data.time) continue;
    // Já disparou hoje (após a meia-noite local).
    if (rule.lastFiredAt && rule.lastFiredAt >= midnight) continue;

    if (await enqueueRuleCommand(rule, act.data, now)) fired += 1;
  }
  return fired;
}
