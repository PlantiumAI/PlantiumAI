import { KpiCard } from "@plantium/ui";

const BG = { padding: "24px", background: "linear-gradient(135deg, #f6faf6 0%, #e7f0ea 100%)", display: "flex", gap: 16, flexWrap: "wrap" as const };

const DropIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);

const TempIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
  </svg>
);

const WindIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
  </svg>
);

export function SensorGrid() {
  return (
    <div style={BG}>
      <div style={{ width: 200 }}>
        <KpiCard
          icon={<DropIcon />}
          label="Umidade do solo"
          value="44%"
          sub="Solo: 22,7 °C"
          status="ideal"
          statusLabel="Ideal"
        />
      </div>
      <div style={{ width: 200 }}>
        <KpiCard
          icon={<TempIcon />}
          label="Temperatura"
          value="26,3°C"
          sub="Setpoint: 24 °C"
          status="atencao"
          statusLabel="Atenção"
        />
      </div>
      <div style={{ width: 200 }}>
        <KpiCard
          icon={<WindIcon />}
          label="CO₂ ambiente"
          value="980"
          sub="ppm · Meta: < 1000"
          status="ideal"
          statusLabel="Ideal"
        />
      </div>
    </div>
  );
}

export function Critical() {
  return (
    <div style={{ ...BG, flexDirection: "column" }}>
      <div style={{ width: 200 }}>
        <KpiCard
          icon={<DropIcon />}
          label="Umidade foliar"
          value="18%"
          sub="Mín. recomendado: 40%"
          status="critico"
          statusLabel="Crítico"
        />
      </div>
    </div>
  );
}

export function NoStatus() {
  return (
    <div style={BG}>
      <div style={{ width: 200 }}>
        <KpiCard
          label="Luminosidade"
          value="3.400"
          sub="lux · sensor 2"
        />
      </div>
    </div>
  );
}
