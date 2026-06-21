"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { deviceTokens } from "@/db/schema";
import { generateDeviceToken } from "@/lib/device-token";

export type TokenState = { token?: string; error?: string };

const schema = z.object({ label: z.string().max(120).optional() });

export async function createToken(
  _prev: TokenState,
  formData: FormData,
): Promise<TokenState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "empresa" || !session.user.companyId) {
    return { error: "Apenas contas de empresa podem gerar tokens." };
  }

  const parsed = schema.safeParse({ label: formData.get("label") || undefined });
  if (!parsed.success) return { error: "Rótulo inválido." };

  const { token, prefix, tokenHash } = generateDeviceToken();
  await db.insert(deviceTokens).values({
    companyId: session.user.companyId,
    prefix,
    tokenHash,
    label: parsed.data.label,
  });

  revalidatePath("/app/tokens");
  // token retornado UMA vez — não é recuperável depois.
  return { token };
}
