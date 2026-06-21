export interface PeriodToggleProps {
  /** Opções (ex.: ["12h","24h","48h","7d"]). */
  options: string[];
  /** Opção selecionada. */
  value: string;
  /** Callback ao trocar. */
  onChange?: (value: string) => void;
}

/**
 * Seletor segmentado em pílula para períodos (12h / 24h / 48h ...).
 */
export function PeriodToggle({ options, value, onChange }: PeriodToggleProps) {
  return (
    <div className="pl-period" role="tablist">
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            role="tab"
            aria-selected={active}
            className={`pl-period__item${active ? " pl-period__item--active" : ""}`}
            onClick={() => onChange?.(opt)}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export default PeriodToggle;
