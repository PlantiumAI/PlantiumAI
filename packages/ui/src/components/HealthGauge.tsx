export interface HealthGaugeProps {
  /** Valor de 0 a 100. */
  value: number;
  /** Diâmetro em px. */
  size?: number;
  /** Espessura do anel em px. */
  thickness?: number;
  /** Rótulo abaixo do número. */
  label?: string;
}

/**
 * Gauge circular de saúde (Health Score). Anel SVG com progresso verde.
 */
export function HealthGauge({
  value,
  size = 140,
  thickness = 12,
  label = "Health Score",
}: HealthGaugeProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="pl-gauge" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--pl-border-subtle)"
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--pl-brand-green)"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="pl-gauge__center">
        <span className="pl-gauge__value" style={{ fontSize: size * 0.28 }}>
          {Math.round(clamped)}%
        </span>
        {label && <span className="pl-gauge__label">{label}</span>}
      </div>
    </div>
  );
}

export default HealthGauge;
