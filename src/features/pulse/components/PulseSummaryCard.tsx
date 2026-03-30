import type { PulseMetricsTotals } from '@/data/types/pulse';

interface PulseSummaryCardProps {
  actionLabel?: string | null;
  data: PulseMetricsTotals | undefined;
  onAction?: (() => void) | null;
}

function SummaryRow({
  accentClassName,
  label,
  value,
}: {
  accentClassName: string;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-3 last:border-b-0 last:pb-0">
      <span className={`h-1.5 w-1.5 rounded-full ${accentClassName}`} />
      <span className="text-[13px] text-[var(--text-secondary)]">{label}</span>
      <span className="ml-auto font-data text-[13px] text-[var(--text-primary)]">{value}</span>
    </div>
  );
}

export default function PulseSummaryCard({ actionLabel, data, onAction }: PulseSummaryCardProps) {
  return (
    <div className="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5">
      <div>
        <h2 className="text-sm font-medium text-[var(--text-primary)]">Resumen del período</h2>
        <p className="mt-1 text-[13px] leading-5 text-[var(--text-secondary)]">Una lectura simple para entender cómo viene tu web</p>
      </div>

      <div className="mt-5 space-y-3">
        <SummaryRow accentClassName="bg-[var(--signal)]" label="Total de visitas" value={data?.visits ?? 0} />
        <SummaryRow accentClassName="bg-[var(--success)]" label="Consultas recibidas" value={data?.contacts ?? 0} />
        <SummaryRow
          accentClassName="bg-[var(--text-tertiary)]"
          label="Promedio de sesión"
          value={`${data?.avgSessionSec ?? 0}s`}
        />
      </div>

      {actionLabel && onAction ? (
        <button className="mt-4 text-sm text-[var(--signal)]" onClick={onAction} type="button">
          {actionLabel} {'->'}
        </button>
      ) : null}
    </div>
  );
}
