// Catálogo de métricas e tipos de sensor — fonte única para forms e dashboards.

export type MetricKey =
  | "soilMoisture"
  | "airTemperature"
  | "airHumidity"
  | "lightLevel"
  | "soilTemperature"
  | "co2Level"
  | "phLevel";

export interface MetricMeta {
  label: string;
  unit: string;
  color: string;
  /** faixa esperada p/ o gauge/escala */
  min: number;
  max: number;
}

export const METRICS: Record<MetricKey, MetricMeta> = {
  soilMoisture: { label: "Umidade do solo", unit: "%", color: "#22c55e", min: 0, max: 100 },
  airTemperature: { label: "Temp. do ar", unit: "°C", color: "#f59e0b", min: -10, max: 60 },
  airHumidity: { label: "Umidade do ar", unit: "%", color: "#38bdf8", min: 0, max: 100 },
  lightLevel: { label: "Luminosidade", unit: "lux", color: "#eab308", min: 0, max: 150000 },
  soilTemperature: { label: "Temp. do solo", unit: "°C", color: "#fb923c", min: -5, max: 50 },
  co2Level: { label: "CO₂", unit: "ppm", color: "#a78bfa", min: 200, max: 2000 },
  phLevel: { label: "pH", unit: "", color: "#34d399", min: 0, max: 14 },
};

export type SensorTypeKey =
  | "estacao_completa"
  | "soil_moisture"
  | "soil_temperature"
  | "air_temperature"
  | "air_humidity"
  | "light_level"
  | "co2_level"
  | "ph_level";

// Tipo do sensor → quais métricas seu dashboard exibe.
export const SENSOR_TYPE_META: Record<
  SensorTypeKey,
  { label: string; metrics: MetricKey[] }
> = {
  estacao_completa: {
    label: "Estação completa",
    metrics: [
      "soilMoisture",
      "airTemperature",
      "airHumidity",
      "soilTemperature",
      "lightLevel",
      "co2Level",
      "phLevel",
    ],
  },
  soil_moisture: { label: "Umidade do solo", metrics: ["soilMoisture"] },
  soil_temperature: { label: "Temp. do solo", metrics: ["soilTemperature"] },
  air_temperature: { label: "Temp. do ar", metrics: ["airTemperature"] },
  air_humidity: { label: "Umidade do ar", metrics: ["airHumidity"] },
  light_level: { label: "Luminosidade", metrics: ["lightLevel"] },
  co2_level: { label: "CO₂", metrics: ["co2Level"] },
  ph_level: { label: "pH", metrics: ["phLevel"] },
};
