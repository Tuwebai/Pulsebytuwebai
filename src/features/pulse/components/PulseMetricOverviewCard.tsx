import type { LucideIcon } from 'lucide-react';

interface PulseMetricOverviewCardProps {
  detail: string;
  icon: LucideIcon;
  label: string;
  tone: 'default' | 'signal' | 'success' | 'warning';
  value: string;
  valueClassName?: string;
}

export default function PulseMetricOverviewCard({
  detail,
  icon: Icon,
  label,
  tone,
  value,
  valueClassName = 'text-[clamp(2.2rem,3vw,2.8rem)]',
}: PulseMetricOverviewCardProps) {
  const iconClassName =
    tone === 'signal'
      ? 'bg-signal/15 text-signal'
      : tone === 'success'
        ? 'bg-emerald-500/15 text-emerald-400'
        : tone === 'warning'
          ? 'bg-amber-500/15 text-amber-400'
          : 'bg-violet-500/15 text-violet-300';

  return (
    <article className="rounded-[22px] border border-white/10 bg-[var(--bg-surface)]/92 px-4 py-4 shadow-[0_14px_30px_rgba(2,6,23,0.22)]">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${iconClassName}`}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Resumen</p>
      </div>

      <div className="mt-4 min-w-0 space-y-1.5">
        <p className="text-sm font-medium text-slate-100">{label}</p>
        <p className={`min-w-0 overflow-hidden text-ellipsis font-data font-light leading-none tracking-tight text-slate-50 ${valueClassName}`}>
          {value}
        </p>
        <p className="text-xs text-slate-400">{detail}</p>
      </div>
    </article>
  );
}
