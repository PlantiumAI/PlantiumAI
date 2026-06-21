"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type TrendRow = {
  label: string;
  soilMoisture: number | null;
  airTemperature: number | null;
};

// Gráfico de tendência da visão geral (umidade do solo × temperatura do ar),
// agregado por hora a partir das leituras reais. Estilo alinhado ao design.
export function OverviewTrend({ data }: { data: TrendRow[] }) {
  if (data.length === 0) {
    return (
      <div className="grid h-56 place-items-center rounded-2xl glass p-8 text-center text-sm text-muted">
        Sem leituras nas últimas 24&nbsp;h. Os gráficos aparecem aqui assim que o
        firmware enviar dados para <code className="font-mono">/api/ingest</code>.
      </div>
    );
  }

  return (
    <div className="rounded-2xl glass p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-600">Tendência (24&nbsp;h)</h2>
        <span className="text-xs text-muted">média por hora</span>
      </div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 8, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="pl-moist" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="pl-temp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,127,127,0.15)" />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} minTickGap={28} stroke="currentColor" opacity={0.5} />
            <YAxis tick={{ fontSize: 10 }} stroke="currentColor" opacity={0.5} domain={["auto", "auto"]} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid rgba(127,127,127,0.2)", fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area
              type="monotone"
              dataKey="soilMoisture"
              name="Umidade solo (%)"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#pl-moist)"
              connectNulls
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="airTemperature"
              name="Temp. ar (°C)"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#pl-temp)"
              connectNulls
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
