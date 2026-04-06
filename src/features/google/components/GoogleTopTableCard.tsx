import { useMemo, useState } from 'react';
import type {
  GoogleSearchConsoleDimensionRow,
  GoogleSearchConsoleMetricKey,
  GoogleSearchConsoleMetricRow,
  GoogleSearchConsoleTableTab,
} from '@/data/types/google';

interface GoogleTopTableCardProps {
  activeMetrics: GoogleSearchConsoleMetricKey[];
  pages: GoogleSearchConsoleDimensionRow[];
  queries: GoogleSearchConsoleDimensionRow[];
  topDays: GoogleSearchConsoleMetricRow[];
}

function formatCtr(value: number) {
  return `${(value * 100).toFixed(1).replace('.', ',')} %`;
}

function formatPageLabel(value: string) {
  try {
    const parsed = new URL(value);
    return `${parsed.origin}${parsed.pathname}`.replace(/\/$/, '');
  } catch {
    return value;
  }
}

const metricColumnMap: Record<
  GoogleSearchConsoleMetricKey,
  {
    colorClassName: string;
    format: (row: { clicks: number; ctr: number; impressions: number; position: number }) => string;
    label: string;
  }
> = {
  clicks: {
    colorClassName: 'bg-[#5AA7FF]/18 text-[#86C5FF]',
    format: (row) => row.clicks.toLocaleString('es-AR'),
    label: 'Clics',
  },
  impressions: {
    colorClassName: 'bg-[#7F64FF]/18 text-[#A994FF]',
    format: (row) => row.impressions.toLocaleString('es-AR'),
    label: 'Impresiones',
  },
  ctr: {
    colorClassName: 'bg-[#10B981]/18 text-[#5BE0AD]',
    format: (row) => formatCtr(row.ctr),
    label: 'CTR',
  },
  position: {
    colorClassName: 'bg-[#F59E0B]/18 text-[#FFD166]',
    format: (row) => row.position.toLocaleString('es-AR'),
    label: 'Posición',
  },
};

export default function GoogleTopTableCard({ activeMetrics, pages, queries, topDays }: GoogleTopTableCardProps) {
  const [tab, setTab] = useState<GoogleSearchConsoleTableTab>('queries');
  const isPagesTab = tab === 'pages';
  const visibleMetrics = useMemo(
    () => ['clicks', 'impressions', 'ctr', 'position'].filter((metric) => activeMetrics.includes(metric as GoogleSearchConsoleMetricKey)),
    [activeMetrics],
  );
  const gridTemplateColumns = useMemo(() => {
    const metricColumns = visibleMetrics.map(() => 'minmax(5.5rem, 0.8fr)').join(' ');
    return isPagesTab ? `minmax(0, 2.8fr) ${metricColumns}` : `minmax(0, 2.3fr) ${metricColumns}`;
  }, [isPagesTab, visibleMetrics]);

  const rows = useMemo(() => {
    if (tab === 'queries') {
      return queries.slice(0, 10).map((row) => ({
        clicks: row.clicks,
        ctr: row.ctr,
        impressions: row.impressions,
        key: row.id,
        label: row.dimensionKey,
        position: row.position,
      }));
    }

    if (tab === 'pages') {
      return pages.slice(0, 10).map((row) => ({
        clicks: row.clicks,
        ctr: row.ctr,
        impressions: row.impressions,
        key: row.id,
        label: formatPageLabel(row.dimensionKey),
        position: row.position,
      }));
    }

    return topDays.slice(0, 10).map((row) => ({
      clicks: row.clicks,
      ctr: row.ctr,
      impressions: row.impressions,
      key: row.id,
      label: row.date,
      position: row.position,
    }));
  }, [pages, queries, tab, topDays]);

  return (
    <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/92 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.24)] sm:p-6">
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
        {[
          { label: 'Consultas', value: 'queries' },
          { label: 'Páginas', value: 'pages' },
          { label: 'Días', value: 'days' },
        ].map((option) => {
          const isActive = option.value === tab;
          return (
            <button
              key={option.value}
              className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${isActive ? 'bg-white text-slate-950' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              onClick={() => setTab(option.value as GoogleSearchConsoleTableTab)}
              type="button"
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
        <div
          className="grid gap-3 bg-[var(--bg-elevated)]/65 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]"
          style={{ gridTemplateColumns }}
        >
          <span>{tab === 'queries' ? 'Consulta' : tab === 'pages' ? 'Página' : 'Día'}</span>
          {visibleMetrics.map((metric) => (
            <span key={metric} className="text-right">
              {metricColumnMap[metric as GoogleSearchConsoleMetricKey].label}
            </span>
          ))}
        </div>

        {rows.length === 0 ? (
          <div className="px-4 py-8 text-center text-[14px] text-[var(--text-secondary)]">
            Todavía no hay suficientes datos para esta vista.
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {rows.map((row) => (
              <div
                key={`${tab}-${row.key}`}
                className="grid gap-3 px-4 py-3 text-[14px] text-[var(--text-secondary)]"
                style={{ gridTemplateColumns }}
              >
                <span
                  className={`text-[var(--text-primary)] ${isPagesTab ? 'break-all text-[13px] leading-5' : 'truncate'}`}
                  title={row.label}
                >
                  {row.label}
                </span>
                {visibleMetrics.map((metric) => (
                  <span key={`${row.key}-${metric}`} className="text-right">
                    <span
                      className={`inline-flex min-w-[3.5rem] justify-end rounded-full px-2.5 py-1 font-semibold ${metricColumnMap[metric as GoogleSearchConsoleMetricKey].colorClassName}`}
                    >
                      {metricColumnMap[metric as GoogleSearchConsoleMetricKey].format(row)}
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
