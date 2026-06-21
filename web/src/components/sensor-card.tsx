import type { LucideIcon } from "lucide-react";
import { Sparkline } from "./sparkline";

export type SensorStatus = "ok" | "warn" | "bad";

const chip: Record<SensorStatus, string> = {
  ok: "bg-brand/10 text-brand",
  warn: "bg-warn/10 text-warn",
  bad: "bg-danger/10 text-danger",
};

const sparkColor: Record<SensorStatus, string> = {
  ok: "#22c55e",
  warn: "#f59e0b",
  bad: "#ef4444",
};

// Card de sensor no estilo do dashboard do Claude Design: ícone em círculo,
// chip de status (Normal/Atenção/Crítico), valor grande e minigráfico (24 h).
export function SensorCard({
  icon: Icon,
  label,
  value,
  unit,
  status,
  statusLabel,
  trend,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  unit?: string;
  status: SensorStatus;
  statusLabel: string;
  trend: (number | null)[];
}) {
  return (
    <div className="flex flex-col rounded-2xl glass p-5">
      <div className="flex items-center justify-between gap-2">
        <span
          className="grid h-9 w-9 place-items-center rounded-full bg-brand/12 text-brand"
          aria-hidden
        >
          <Icon size={17} />
        </span>
        <span className={`rounded-full px-2.5 py-1 text-xs font-600 ${chip[status]}`}>
          {statusLabel}
        </span>
      </div>
      <p className="mt-3 text-xs font-500 uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-700">
        {value}
        {unit && <span className="ml-0.5 text-base text-muted">{unit}</span>}
      </p>
      <div className="mt-3">
        <Sparkline data={trend} color={sparkColor[status]} />
      </div>
    </div>
  );
}
