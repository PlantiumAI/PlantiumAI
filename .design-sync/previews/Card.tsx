import { Card } from "@plantium/ui";

const BG = { padding: "24px", background: "linear-gradient(135deg, #f6faf6 0%, #e7f0ea 100%)" };

export function Glass() {
  return (
    <div style={BG}>
      <Card variant="glass" style={{ maxWidth: 360 }}>
        <h3 style={{ margin: "0 0 8px", fontFamily: "Sora, Inter, sans-serif", fontSize: 18, color: "var(--pl-text-base)" }}>Estufa A — Bloco Norte</h3>
        <p style={{ margin: 0, fontSize: 14, color: "var(--pl-text-muted)" }}>Sistema de irrigação ativo. Última leitura há 2 min.</p>
      </Card>
    </div>
  );
}

export function Solid() {
  return (
    <div style={BG}>
      <Card variant="solid" style={{ maxWidth: 360 }}>
        <h3 style={{ margin: "0 0 8px", fontFamily: "Sora, Inter, sans-serif", fontSize: 18, color: "var(--pl-text-base)" }}>Configurações da estufa</h3>
        <p style={{ margin: 0, fontSize: 14, color: "var(--pl-text-muted)" }}>Temperatura alvo: 24 °C · Umidade: 60–70%</p>
      </Card>
    </div>
  );
}

export function Feature() {
  return (
    <div style={BG}>
      <Card variant="glass" feature style={{ maxWidth: 400 }}>
        <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--pl-text-muted)" }}>Plano Premium</p>
        <h2 style={{ margin: "0 0 12px", fontFamily: "Sora, Inter, sans-serif", fontSize: 28, color: "var(--pl-text-base)" }}>Monitoramento inteligente</h2>
        <p style={{ margin: 0, fontSize: 15, color: "var(--pl-text-muted)" }}>Alertas em tempo real, histórico de 90 dias e controle remoto ilimitado.</p>
      </Card>
    </div>
  );
}

export function Hover() {
  return (
    <div style={{ ...BG, display: "flex", gap: 16 }}>
      <Card variant="glass" hover style={{ flex: 1 }}>
        <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--pl-text-muted)" }}>Bloco A</p>
        <p style={{ margin: 0, fontFamily: "Sora, Inter, sans-serif", fontSize: 24, fontWeight: 700, color: "var(--pl-text-base)" }}>72%</p>
      </Card>
      <Card variant="glass" hover style={{ flex: 1 }}>
        <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--pl-text-muted)" }}>Bloco B</p>
        <p style={{ margin: 0, fontFamily: "Sora, Inter, sans-serif", fontSize: 24, fontWeight: 700, color: "var(--pl-text-base)" }}>58%</p>
      </Card>
    </div>
  );
}
