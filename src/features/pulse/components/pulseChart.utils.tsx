import type { ChartDataPoint, PulseChartMode } from '@/data/types/pulse';

interface TooltipProps {
  active?: boolean;
  mode: PulseChartMode;
  payload?: Array<{
    payload: ChartDataPoint;
  }>;
}

export function formatMetricLabel(mode: PulseChartMode, value: number) {
  return mode === 'contacts' ? `${value.toLocaleString('es-AR')} consultas` : `${value.toLocaleString('es-AR')} visitas`;
}

function getExecutiveInsight(mode: PulseChartMode, point: ChartDataPoint) {
  const currentValue = mode === 'contacts' ? point.contacts : point.visits;
  const previousValue = mode === 'contacts' ? point.previousContacts : point.previousVisits;

  if (mode === 'visits' && point.contacts > 0) {
    return point.contacts === 1 ? 'Ese día llegó una consulta.' : `Ese día llegaron ${point.contacts} consultas.`;
  }

  if (previousValue === null) {
    return mode === 'contacts' ? 'Todavía no hay comparación para este punto.' : 'Todavía no hay referencia anterior para comparar.';
  }

  if (currentValue > previousValue) {
    return 'Mejor que el período anterior.';
  }

  if (currentValue < previousValue) {
    return 'Por debajo del período anterior.';
  }

  return 'Se mantuvo en línea con el período anterior.';
}

export function PulseChartTooltip({ active, mode, payload }: TooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;
  const currentValue = mode === 'contacts' ? point.contacts : point.visits;
  const previousValue = mode === 'contacts' ? point.previousContacts : point.previousVisits;

  return (
    <div
      className="rounded-[12px] border border-[var(--border-strong)] bg-[var(--bg-elevated)] px-4 py-3 shadow-lg"
      style={{ minWidth: 220 }}
    >
      <p className="text-[12px] text-[var(--text-tertiary)]">{point.date}</p>
      <p className="mt-2 font-data text-[20px] font-light text-[var(--text-primary)]">{formatMetricLabel(mode, currentValue)}</p>
      <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
        {previousValue === null ? 'Sin comparación anterior' : `Período anterior: ${formatMetricLabel(mode, previousValue)}`}
      </p>
      {mode === 'visits' && point.contacts > 0 ? <p className="mt-1 text-[12px] text-[var(--success)]">{formatMetricLabel('contacts', point.contacts)}</p> : null}
      <p className="mt-3 text-[12px] leading-5 text-[var(--text-secondary)]">{getExecutiveInsight(mode, point)}</p>
    </div>
  );
}

export function PulseChartModeToggle({
  mode,
  onChange,
}: {
  mode: PulseChartMode;
  onChange: (mode: PulseChartMode) => void;
}) {
  const baseClassName = 'rounded-full border px-3 py-1.5 text-[12px] font-medium transition-colors';

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)]/70 p-1">
      <button
        className={`${baseClassName} ${mode === 'visits' ? 'border-[var(--signal-border)] bg-[color:var(--signal-glow)] text-[var(--signal)]' : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'}`}
        onClick={() => onChange('visits')}
        type="button"
      >
        Visitas
      </button>
      <button
        className={`${baseClassName} ${mode === 'contacts' ? 'border-[var(--signal-border)] bg-[color:var(--signal-glow)] text-[var(--signal)]' : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)]'}`}
        onClick={() => onChange('contacts')}
        type="button"
      >
        Consultas
      </button>
    </div>
  );
}
