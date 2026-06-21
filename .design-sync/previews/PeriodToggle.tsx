import { PeriodToggle } from "@plantium/ui";

const BG = { padding: "24px", background: "var(--pl-bg-base)", display: "flex", gap: 16, flexDirection: "column" as const, alignItems: "flex-start" };

export function ShortTerm() {
  return (
    <div style={BG}>
      <PeriodToggle options={["12h", "24h", "48h"]} value="24h" />
    </div>
  );
}

export function LongTerm() {
  return (
    <div style={BG}>
      <PeriodToggle options={["7d", "14d", "30d", "90d"]} value="30d" />
    </div>
  );
}

export function FirstSelected() {
  return (
    <div style={BG}>
      <PeriodToggle options={["12h", "24h", "48h", "7d"]} value="12h" />
    </div>
  );
}
