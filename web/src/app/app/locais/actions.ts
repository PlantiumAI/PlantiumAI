"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { locations } from "@/db/schema";
import { requireCompany } from "@/lib/session";

export type LocationFormState = { error?: string; ok?: boolean };

const schema = z.object({
  name: z.string().min(2, "Informe o nome do local."),
  type: z.enum(["estufa", "plantacao_vertical", "container"]),
  description: z.string().max(500).optional(),
});

export async function createLocation(
  _prev: LocationFormState,
  formData: FormData,
): Promise<LocationFormState> {
  const ctx = await requireCompany();
  if ("error" in ctx) return { error: ctx.error };

  const parsed = schema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  await db.insert(locations).values({ ...parsed.data, companyId: ctx.companyId });
  revalidatePath("/app/locais");
  return { ok: true };
}

export async function updateLocation(
  _prev: LocationFormState,
  formData: FormData,
): Promise<LocationFormState> {
  const ctx = await requireCompany();
  if ("error" in ctx) return { error: ctx.error };

  const id = String(formData.get("id") ?? "");
  const parsed = schema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    description: formData.get("description") || undefined,
  });
  if (!id || !parsed.success) return { error: parsed.error?.issues[0]?.message ?? "Dados inválidos." };

  await db
    .update(locations)
    .set(parsed.data)
    .where(and(eq(locations.id, id), eq(locations.companyId, ctx.companyId)));
  revalidatePath("/app/locais");
  redirect("/app/locais");
}

export async function deleteLocation(formData: FormData): Promise<void> {
  const ctx = await requireCompany();
  if ("error" in ctx) return;
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db
    .delete(locations)
    .where(and(eq(locations.id, id), eq(locations.companyId, ctx.companyId)));
  revalidatePath("/app/locais");
}
