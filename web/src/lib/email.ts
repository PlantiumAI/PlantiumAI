// Envio de email transacional — plugável. Usa Resend (HTTP) se RESEND_API_KEY
// estiver definido; caso contrário, registra o conteúdo no log do servidor
// (modo dev/sem provedor). Chamado SOMENTE no backend (server actions/route).

const FROM = process.env.EMAIL_FROM || "PlantiumAI <onboarding@resend.dev>";

type SendArgs = { to: string; subject: string; html: string; text?: string };

export async function sendEmail({ to, subject, html, text }: SendArgs): Promise<{ ok: boolean }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // Sem provedor configurado: não falha o fluxo; loga p/ o dev acompanhar.
    console.warn(`[email] RESEND_API_KEY ausente — email NÃO enviado.\n  para: ${to}\n  assunto: ${subject}\n  ${text ?? html}`);
    return { ok: false };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to, subject, html, text }),
    });
    if (!res.ok) {
      console.error("[email] Resend respondeu", res.status, await res.text());
      return { ok: false };
    }
    return { ok: true };
  } catch (e) {
    console.error("[email] falha ao enviar", e);
    return { ok: false };
  }
}

// Template do email de redefinição (tema verde PlantiumAI).
export function passwordResetEmail(link: string): { subject: string; html: string; text: string } {
  const subject = "Redefinição de senha · PlantiumAI";
  const text = `Recebemos um pedido para redefinir sua senha na PlantiumAI.\n\nAbra o link abaixo (válido por 30 minutos) para criar uma nova senha:\n${link}\n\nSe você não solicitou, ignore este email — sua senha continua a mesma.`;
  const html = `
  <div style="font-family:Inter,Segoe UI,system-ui,sans-serif;max-width:480px;margin:0 auto;color:#152a1f">
    <div style="text-align:center;padding:24px 0">
      <span style="display:inline-flex;align-items:center;gap:8px;font-weight:700;font-size:20px">
        <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background:#22c55e"></span>
        Plantium<span style="color:#16a34a">AI</span>
      </span>
    </div>
    <div style="background:#f6faf6;border:1px solid #e2e8f0;border-radius:16px;padding:28px">
      <h1 style="font-size:18px;margin:0 0 12px">Redefinição de senha</h1>
      <p style="font-size:14px;line-height:1.6;color:#5b6b61;margin:0 0 20px">Recebemos um pedido para redefinir sua senha. Clique no botão abaixo para criar uma nova senha. O link expira em <b>30 minutos</b>.</p>
      <a href="${link}" style="display:inline-block;background:#22c55e;color:#fff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px">Redefinir senha</a>
      <p style="font-size:12px;color:#8a978f;margin:20px 0 0;word-break:break-all">Ou copie e cole: ${link}</p>
    </div>
    <p style="font-size:12px;color:#8a978f;text-align:center;padding:18px 0">Se você não solicitou, ignore este email — sua senha continua a mesma.</p>
  </div>`;
  return { subject, html, text };
}
