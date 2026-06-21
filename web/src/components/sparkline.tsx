// Minigráfico de linha (sparkline) — SVG puro, renderiza no servidor.
// Espelha as séries dos cards de sensor do design importado do Claude Design.

export function Sparkline({
  data,
  color = "#22c55e",
  width = 240,
  height = 44,
}: {
  data: (number | null)[];
  color?: string;
  width?: number;
  height?: number;
}) {
  const pts = data.filter((v): v is number => typeof v === "number");
  if (pts.length < 2) {
    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden>
        <line x1="0" y1={height - 4} x2={width} y2={height - 4} stroke={color} strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const span = max - min || 1;
  const pad = 4;
  const usableH = height - pad * 2;
  const step = width / (pts.length - 1);

  const coords = pts.map((v, i) => {
    const x = i * step;
    const y = pad + (1 - (v - min) / span) * usableH;
    return [x, y] as const;
  });

  const line = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  const gid = `spark-${color.replace("#", "")}`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.22} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
