// Anel de saúde (Health score) — espelha o gauge do design importado do
// Claude Design. Componente puro (sem estado), renderiza no servidor.

export function HealthGauge({
  value,
  size = 132,
  thickness = 12,
  label = "Health score",
}: {
  value: number | null;
  size?: number;
  thickness?: number;
  label?: string;
}) {
  const r = size / 2 - thickness / 2 - 4;
  const c = 2 * Math.PI * r;
  const pct = value === null ? 0 : Math.max(0, Math.min(100, value));
  const offset = c * (1 - pct / 100);
  const center = size / 2;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={center} cy={center} r={r} fill="none" stroke="rgba(127,127,127,0.18)" strokeWidth={thickness} />
        <defs>
          <linearGradient id="pl-health" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#34d977" />
            <stop offset="1" stopColor="#16a34a" />
          </linearGradient>
        </defs>
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="url(#pl-health)"
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="font-display font-700 text-brand" style={{ fontSize: size * 0.26, lineHeight: 1 }}>
          {value === null ? "—" : Math.round(value)}
          {value !== null && <span style={{ fontSize: size * 0.13 }}>%</span>}
        </div>
        <div className="text-muted" style={{ fontSize: 11, marginTop: 2 }}>
          {label}
        </div>
      </div>
    </div>
  );
}
