import { ExternalLink, RefreshCw } from 'lucide-react';
import type { Period } from '@/data/types/pulse';
import PeriodSelector from './PeriodSelector';

interface PulsePageHeaderProps {
  dateRangeLabel: string;
  domain: string | null;
  hasProject: boolean;
  isRefreshing: boolean;
  onOpenSite: () => void;
  onRefreshMetrics: () => void;
  period: Period;
  setPeriod: (period: Period) => void;
}

export default function PulsePageHeader({
  dateRangeLabel,
  domain,
  hasProject,
  isRefreshing,
  onOpenSite,
  onRefreshMetrics,
  period,
  setPeriod,
}: PulsePageHeaderProps) {
  return (
    <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-[22px] font-medium text-[var(--text-primary)]">Tu web este mes</h1>
        <p className="text-[14px] leading-5 text-[var(--text-secondary)]">{dateRangeLabel}</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center" data-tour="pulse-period-selector">
        <PeriodSelector disabled={!hasProject} onChange={setPeriod} value={period} />
        <button
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] px-3 py-2 text-sm text-[var(--text-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!hasProject || isRefreshing}
          onClick={onRefreshMetrics}
          type="button"
        >
          <RefreshCw className={isRefreshing ? 'animate-spin' : ''} size={14} strokeWidth={1.5} />
          {isRefreshing ? 'Actualizando...' : 'Actualizar datos'}
        </button>
        <button
          className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] px-3 py-2 text-sm text-[var(--text-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!domain}
          onClick={onOpenSite}
          type="button"
        >
          Ver mi sitio <ExternalLink size={14} strokeWidth={1.5} />
        </button>
      </div>
    </section>
  );
}
