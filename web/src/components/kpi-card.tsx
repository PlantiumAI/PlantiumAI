import type { LucideIcon } from "lucide-react";

type Tone = "brand" | "warn" | "danger" | "info";

const toneIcon: Record<Tone, string> = {
  brand: "bg-brand/12 text-brand",
  warn: "bg-warn/12 text-warn",
  danger: "bg-danger/12 text-danger",
  info: "bg-info/12 text-info",
};

const toneChip: Record<Tone, string> = {
  brand: "bg-brand/10 text-brand",
  warn: "bg-warn/10 text-warn",
  danger: "bg-danger/10 text-danger",
  info: "bg-info/10 text-info",
};

// Cartão de KPI no estilo do design importado (ícone em círculo, número
// grande em Sora, chip de status opcional). Usado no dashboard /app.
export function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "brand",
  status,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  tone?: Tone;
  status?: string;
}) {
  return (
    <div className="rounded-2xl glass p-5">
      <div className="flex items-center justify-between gap-2">
        <span
          className={`grid h-9 w-9 place-items-center rounded-full ${toneIcon[tone]}`}
          aria-hidden
        >
          <Icon size={17} />
        </span>
        {status && (
          <span className={`rounded-full px-2.5 py-1 text-xs font-600 ${toneChip[tone]}`}>
            {status}
          </span>
        )}
      </div>
      <p className="mt-3 text-xs font-500 uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 font-display text-3xl font-700">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
