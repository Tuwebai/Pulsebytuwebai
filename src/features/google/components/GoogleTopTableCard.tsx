import { useMemo, useState } from 'react';
import type { GoogleSearchConsoleDimensionRow, GoogleSearchConsoleMetricRow, GoogleSearchConsoleTableTab } from '@/data/types/google';

interface GoogleTopTableCardProps {
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
    return parsed.pathname === '/' ? parsed.hostname : parsed.pathname;
  } catch {
    return value;
  }
}

export default function GoogleTopTableCard({ pages, queries, topDays }: GoogleTopTableCardProps) {
  const [tab, setTab] = useState<GoogleSearchConsoleTableTab>('queries');

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
        <div className="grid grid-cols-[minmax(0,1.8fr)_0.6fr_0.9fr_0.7fr_0.7fr] gap-3 bg-[var(--bg-elevated)]/65 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
          <span>{tab === 'queries' ? 'Consulta' : tab === 'pages' ? 'Página' : 'Día'}</span>
          <span className="text-right">Clics</span>
          <span className="text-right">Impresiones</span>
          <span className="text-right">CTR</span>
          <span className="text-right">Posición</span>
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
                className="grid grid-cols-[minmax(0,1.8fr)_0.6fr_0.9fr_0.7fr_0.7fr] gap-3 px-4 py-3 text-[14px] text-[var(--text-secondary)]"
              >
                <span className="truncate text-[var(--text-primary)]">{row.label}</span>
                <span className="text-right">{row.clicks.toLocaleString('es-AR')}</span>
                <span className="text-right">{row.impressions.toLocaleString('es-AR')}</span>
                <span className="text-right">{formatCtr(row.ctr)}</span>
                <span className="text-right">{row.position.toLocaleString('es-AR')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
