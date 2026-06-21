// Regras de domínio portadas do SistemaLegado/desktop (ver Brain:
// concepts/sistema-legado-componentes.md). Faixas de validação e classificação.

export const VALID_RANGES = {
  soilMoisture: [0, 100],
  airTemperature: [-10, 60],
  airHumidity: [0, 100],
  lightLevel: [0, 150000],
  soilTemperature: [-5, 50],
  co2Level: [200, 2000],
  phLevel: [0, 14],
} as const;

export type Metric = keyof typeof VALID_RANGES;

/** Valida um valor de métrica contra a faixa física aceitável. */
export function isInRange(metric: Metric, value: number | null | undefined): boolean {
  if (value === null || value === undefined || Number.isNaN(value)) return false;
  const [min, max] = VALID_RANGES[metric];
  return value >= min && value <= max;
}

/** Classificação de umidade do solo (dry/low/optimal/high/saturated). */
export function classifyMoisture(
  value: number,
  idealMin = 35,
  idealMax = 65,
): "dry" | "low" | "optimal" | "high" | "saturated" {
  if (value < idealMin * 0.5) return "dry";
  if (value < idealMin) return "low";
  if (value <= idealMax) return "optimal";
  if (value <= idealMax * 1.2) return "high";
  return "saturated";
}

/**
 * Faixas ideais (verde) e de atenção (amarelo) por métrica. Fora da faixa de
 * atenção → crítico (vermelho). Usado nos chips dos cards de sensor.
 */
const IDEAL: Partial<Record<Metric, { ideal: [number, number]; warn: [number, number] }>> = {
  soilMoisture: { ideal: [35, 65], warn: [20, 80] },
  airTemperature: { ideal: [18, 30], warn: [10, 38] },
  airHumidity: { ideal: [45, 80], warn: [30, 92] },
  soilTemperature: { ideal: [15, 28], warn: [8, 35] },
  co2Level: { ideal: [350, 1000], warn: [300, 1400] },
  phLevel: { ideal: [5.8, 7.2], warn: [5.2, 7.8] },
  lightLevel: { ideal: [8000, 45000], warn: [2000, 60000] },
};

/** Classifica uma métrica em ok/warn/bad com rótulo pt-BR para o chip. */
export function classifyMetric(
  metric: Metric,
  value: number | null,
): { status: "ok" | "warn" | "bad"; label: string } {
  if (value === null || Number.isNaN(value)) return { status: "warn", label: "Sem dado" };
  const cfg = IDEAL[metric];
  if (!cfg) return { status: "ok", label: "Normal" };
  const [imin, imax] = cfg.ideal;
  const [wmin, wmax] = cfg.warn;
  if (value >= imin && value <= imax) return { status: "ok", label: "Normal" };
  if (value >= wmin && value <= wmax) return { status: "warn", label: "Atenção" };
  return { status: "bad", label: "Crítico" };
}

/** Decisão de irrigação por regra (fallback sem IA). Portado do legado. */
export function ruleBasedIrrigation(
  soilMoisture: number,
  idealMin = 35,
  idealMax = 65,
): { shouldIrrigate: boolean; urgency: "critical" | "medium" | "none"; durationMinutes: number; reasoning: string } {
  if (soilMoisture < idealMin * 0.6)
    return { shouldIrrigate: true, urgency: "critical", durationMinutes: 25, reasoning: `Solo criticamente seco (${soilMoisture.toFixed(0)}%)` };
  if (soilMoisture < idealMin)
    return { shouldIrrigate: true, urgency: "medium", durationMinutes: 15, reasoning: `Solo abaixo do ideal (${soilMoisture.toFixed(0)}% < ${idealMin}%)` };
  if (soilMoisture > idealMax)
    return { shouldIrrigate: false, urgency: "none", durationMinutes: 0, reasoning: `Solo úmido o suficiente (${soilMoisture.toFixed(0)}%)` };
  return { shouldIrrigate: false, urgency: "none", durationMinutes: 0, reasoning: `Solo em nível ideal (${soilMoisture.toFixed(0)}%)` };
}
