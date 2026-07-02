"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { alerts } from "@/db/schema";

/** Marca um alerta da empresa do usuário como resolvido. */
export async function resolveAlertAction(formData: FormData): Promise<void> {
  const session = await auth();
  const companyId = session?.user?.companyId;
  if (!companyId) return;

  const id = String(formData.get("id") ?? "");
  if (!z.string().uuid().safeParse(id).success) return;

  await db
    .update(alerts)
    .set({ resolved: true, resolvedAt: new Date() })
    .where(and(eq(alerts.id, id), eq(alerts.companyId, companyId)));

  revalidatePath("/app/alertas");
  revalidatePath("/app");
}
