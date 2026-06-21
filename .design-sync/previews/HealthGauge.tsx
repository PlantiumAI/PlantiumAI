import { HealthGauge } from "@plantium/ui";

const BG = { padding: "32px 24px", background: "linear-gradient(135deg, #f6faf6 0%, #e7f0ea 100%)", display: "flex", gap: 32, alignItems: "center", justifyContent: "center", flexWrap: "wrap" as const };

export function HighHealth() {
  return (
    <div style={BG}>
      <HealthGauge value={92} label="Estufa A" />
    </div>
  );
}

export function MediumHealth() {
  return (
    <div style={BG}>
      <HealthGauge value={61} label="Estufa B" />
    </div>
  );
}

export function LowHealth() {
  return (
    <div style={BG}>
      <HealthGauge value={23} label="Estufa C" />
    </div>
  );
}

export function Sizes() {
  return (
    <div style={BG}>
      <HealthGauge value={78} size={80} thickness={8} label="sm" />
      <HealthGauge value={78} size={140} thickness={12} label="md (padrão)" />
      <HealthGauge value={78} size={200} thickness={16} label="lg" />
    </div>
  );
}
