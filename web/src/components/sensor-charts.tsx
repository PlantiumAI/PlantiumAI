"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { METRICS, type MetricKey } from "@/lib/sensor-types";
import { classifyMoisture } from "@/lib/sensor-rules";

type Row = { label: string } & Partial<Record<MetricKey, number | null>>;

const moistureLabel: Record<string, string> = {
  dry: "Seco",
  low: "Abaixo",
  optimal: "Ideal",
  high: "Alto",
  saturated: "Encharcado",
};

function lastValue(data: Row[], key: MetricKey): number | null {
  for (let i = data.length - 1; i >= 0; i--) {
    const v = data[i][key];
    if (typeof v === "number") return v;
  }
  return null;
}

function statusFor(key: MetricKey, value: number) {
  const m = METRICS[key];
  if (key === "soilMoisture") {
    const c = classifyMoisture(value);
    const tone = c === "optimal" ? "brand" : c === "dry" || c === "saturated" ? "danger" : "warn";
    return { text: moistureLabel[c], tone };
  }
  const inRange = value >= m.min && value <= m.max;
  return { text: inRange ? "Normal" : "Fora de faixa", tone: inRange ? "brand" : "warn" };
}

const toneClass: Record<string, string> = {
  brand: "bg-brand/10 text-brand",
  warn: "bg-warn/10 text-warn",
  danger: "bg-danger/10 text-danger",
};

export function SensorCharts({
  metrics,
  data,
}: {
  metrics: MetricKey[];
  data: Row[];
}) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl glass p-8 text-center text-sm text-muted">
        Ainda não há leituras para este sensor. Assim que o firmware enviar dados
        para <code className="font-mono">/api/ingest</code>, os gráficos aparecem aqui.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {metrics.map((key) => {
        const meta = METRICS[key];
        const latest = lastValue(data, key);
        const status = latest !== null ? statusFor(key, latest) : null;

        return (
          <div key={key} className="rounded-2xl glass p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-600">{meta.label}</h3>
                <p className="font-display text-2xl font-700">
                  {latest !== null ? latest.toFixed(1) : "—"}
                  <span className="ml-1 text-sm font-500 text-muted">{meta.unit}</span>
                </p>
              </div>
              {status && (
                <span className={`rounded-full px-2.5 py-1 text-xs font-600 ${toneClass[status.tone]}`}>
                  {status.text}
                </span>
              )}
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,127,127,0.15)" />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} minTickGap={32} stroke="currentColor" opacity={0.5} />
                  <YAxis tick={{ fontSize: 10 }} stroke="currentColor" opacity={0.5} domain={["auto", "auto"]} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid rgba(127,127,127,0.2)",
                      fontSize: 12,
                    }}
                    formatter={(v) => [`${v} ${meta.unit}`, meta.label]}
                  />
                  <Line
                    type="monotone"
                    dataKey={key}
                    stroke={meta.color}
                    strokeWidth={2}
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
    </div>
  );
}
