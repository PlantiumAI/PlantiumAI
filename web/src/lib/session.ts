import { auth } from "@/auth";

/**
 * Garante uma sessão de empresa com companyId. Retorna os dados ou um erro
 * padronizado para uso em server actions.
 */
export async function requireCompany() {
  const session = await auth();
  if (!session?.user) {
    return { error: "Não autenticado." as const };
  }
  if (session.user.role !== "empresa" || !session.user.companyId) {
    return { error: "Apenas contas de empresa podem gerenciar este recurso." as const };
  }
  return { companyId: session.user.companyId, userId: session.user.id };
}
