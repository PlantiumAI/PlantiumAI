import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { automationRules } from "@/db/schema";
import { evaluateScheduleRules } from "@/lib/automation";

export const runtime = "nodejs";

/**
 * GET /api/cron/automations — reforço externo para regras de HORÁRIO.
 * O caminho principal é a avaliação a cada contato de device; esta rota
 * cobre estufas com device offline no horário agendado. Pode ser chamada
 * por Vercel Cron (plano pago) ou serviço externo (ex.: cron-job.org).
 * Protegida por CRON_SECRET quando definido (padrão Vercel Cron).
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  // Empresas com regras habilitadas (distinct via agrupamento em JS).
  const rows = await db
    .select({ companyId: automationRules.companyId })
    .from(automationRules)
    .where(eq(automationRules.enabled, true));
  const companies = [...new Set(rows.map((r) => r.companyId))];

  let fired = 0;
  for (const companyId of companies) {
    try {
      fired += await evaluateScheduleRules(companyId);
    } catch (err) {
      console.error(`cron/automations: falha na empresa ${companyId}`, err);
    }
  }

  return NextResponse.json({ ok: true, companies: companies.length, fired });
}
