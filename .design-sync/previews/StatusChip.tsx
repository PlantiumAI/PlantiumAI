import { StatusChip } from "@plantium/ui";

const Row = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 24px", background: "var(--pl-bg-base)", flexWrap: "wrap" as const }}>
    {children}
  </div>
);

export function AllStatuses() {
  return (
    <Row>
      <StatusChip status="ideal">Ideal</StatusChip>
      <StatusChip status="atencao">Atenção</StatusChip>
      <StatusChip status="critico">Crítico</StatusChip>
      <StatusChip status="neutro">Neutro</StatusChip>
    </Row>
  );
}

export function NoDot() {
  return (
    <Row>
      <StatusChip status="ideal" dot={false}>Ideal</StatusChip>
      <StatusChip status="atencao" dot={false}>Atenção</StatusChip>
      <StatusChip status="critico" dot={false}>Crítico</StatusChip>
    </Row>
  );
}

export function InContext() {
  return (
    <div style={{ padding: "20px 24px", background: "var(--pl-bg-base)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { label: "Umidade", value: "44%", status: "ideal" as const, chip: "Ideal" },
          { label: "Temperatura", value: "27°C", status: "atencao" as const, chip: "Atenção" },
          { label: "CO₂", value: "1.250 ppm", status: "critico" as const, chip: "Crítico" },
          { label: "Luz", value: "—", status: "neutro" as const, chip: "Sem dados" },
        ].map(({ label, value, status, chip }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 12, background: "var(--pl-surface-solid)", boxShadow: "var(--pl-shadow-soft)" }}>
            <span style={{ fontSize: 14, color: "var(--pl-text-muted)" }}>{label}</span>
            <span style={{ fontWeight: 600, color: "var(--pl-text-base)" }}>{value}</span>
            <StatusChip status={status}>{chip}</StatusChip>
          </div>
        ))}
      </div>
    </div>
  );
}
