import type { ReactNode } from "react";
import { Card } from "./Card";
import { StatusChip, type StatusKind } from "./StatusChip";

export interface KpiCardProps {
  /** Ícone (ex.: gota, termômetro). */
  icon?: ReactNode;
  /** Rótulo curto (ex.: "Umidade do solo"). */
  label: string;
  /** Valor grande (ex.: "44%"). */
  value: string;
  /** Texto secundário (ex.: "Solo: 22.7°C"). */
  sub?: string;
  /** Status opcional exibido como chip. */
  status?: StatusKind;
  /** Texto do chip de status (ex.: "Ideal"). */
  statusLabel?: string;
}

/**
 * Card de KPI/sensor: ícone em círculo verde, rótulo, valor grande e chip de status.
 */
export function KpiCard({ icon, label, value, sub, status, statusLabel }: KpiCardProps) {
  return (
    <Card hover className="pl-kpi">
      {icon && <span className="pl-kpi__icon">{icon}</span>}
      <span className="pl-kpi__label">{label}</span>
      <span className="pl-kpi__value">{value}</span>
      {sub && <span className="pl-kpi__sub">{sub}</span>}
      {status && statusLabel && <StatusChip status={status}>{statusLabel}</StatusChip>}
    </Card>
  );
}

export default KpiCard;
