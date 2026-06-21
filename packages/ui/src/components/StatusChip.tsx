import type { ReactNode } from "react";

export type StatusKind = "ideal" | "atencao" | "critico" | "neutro";

export interface StatusChipProps {
  /** Estado do indicador. */
  status?: StatusKind;
  /** Mostra a bolinha de cor à esquerda. */
  dot?: boolean;
  children: ReactNode;
}

/**
 * Chip de status (Ideal / Atenção / Crítico) com cores semânticas.
 */
export function StatusChip({ status = "ideal", dot = true, children }: StatusChipProps) {
  return (
    <span className={`pl-chip pl-chip--${status}`}>
      {dot && <span className="pl-chip__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}

export default StatusChip;
