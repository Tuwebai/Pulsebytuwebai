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
    <div className="flex items-center gap-3 border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
      <span className={`h-1.5 w-1.5 rounded-full ${accentClassName}`} />
      <span className="text-[13px] text-slate-300">{label}</span>
      <span className="ml-auto font-data text-[13px] text-slate-50">{value}</span>
    </div>
  );
}

export default function PulseSummaryCard({ actionLabel, data, onAction }: PulseSummaryCardProps) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/92 p-4 shadow-[0_18px_40px_rgba(2,6,23,0.24)] sm:p-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Resumen</p>
        <h2 className="mt-2 text-sm font-medium text-slate-100">Resumen del período</h2>
        <p className="mt-1 text-[13px] leading-5 text-slate-400">Una lectura simple para entender cómo viene tu web</p>
      </div>

      <div className="mt-5 space-y-3">
        <SummaryRow accentClassName="bg-signal" label="Total de visitas" value={data?.visits ?? 0} />
        <SummaryRow accentClassName="bg-emerald-400" label="Consultas recibidas" value={data?.contacts ?? 0} />
        <SummaryRow accentClassName="bg-slate-500" label="Promedio de sesión" value={`${data?.avgSessionSec ?? 0}s`} />
      </div>

      {actionLabel && onAction ? (
        <button
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm text-slate-200 transition-colors hover:border-white/15 hover:text-white"
          onClick={onAction}
          type="button"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
