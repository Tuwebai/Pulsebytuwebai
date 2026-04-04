import { useState } from 'react';
import type { GoogleSearchConsoleDimensionRow } from '@/data/types/google';

interface GoogleTopTableCardProps {
  pages: GoogleSearchConsoleDimensionRow[];
  queries: GoogleSearchConsoleDimensionRow[];
}

type GoogleTableTab = 'pages' | 'queries';

function formatCtr(value: number) {
  return `${(value * 100).toFixed(1).replace('.', ',')} %`;
}

function formatLabel(value: string, tab: GoogleTableTab) {
  if (tab === 'queries') {
    return value;
  }

  try {
    const parsed = new URL(value);
    return parsed.pathname === '/' ? parsed.hostname : parsed.pathname;
  } catch {
    return value;
  }
}

export default function GoogleTopTableCard({ pages, queries }: GoogleTopTableCardProps) {
  const [tab, setTab] = useState<GoogleTableTab>('queries');
  const rows = tab === 'queries' ? queries : pages;

  return (
    <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/92 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.24)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Detalle</p>
          <h2 className="mt-3 text-[18px] font-medium text-[var(--text-primary)]">
            {tab === 'queries' ? 'Búsquedas que ya te muestran' : 'Páginas con más visibilidad'}
          </h2>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)]/70 p-1">
          <button
            className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${tab === 'queries' ? 'bg-[#78B7FF]/15 text-[#78B7FF]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            onClick={() => setTab('queries')}
            type="button"
          >
            Consultas
          </button>
          <button
            className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${tab === 'pages' ? 'bg-[#8D78FF]/15 text-[#8D78FF]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            onClick={() => setTab('pages')}
            type="button"
          >
            Páginas
          </button>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
        <div className="grid grid-cols-[minmax(0,1.8fr)_0.7fr_0.9fr_0.8fr] gap-3 bg-[var(--bg-elevated)]/65 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
          <span>{tab === 'queries' ? 'Consulta' : 'Página'}</span>
          <span className="text-right">Clics</span>
          <span className="text-right">Impresiones</span>
          <span className="text-right">CTR</span>
        </div>

        {rows.length === 0 ? (
          <div className="px-4 py-8 text-center text-[14px] text-[var(--text-secondary)]">
            Todavía no hay suficientes datos para listar {tab === 'queries' ? 'consultas' : 'páginas'}.
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {rows.slice(0, 10).map((row) => (
              <div
                key={`${tab}-${row.id}`}
                className="grid grid-cols-[minmax(0,1.8fr)_0.7fr_0.9fr_0.8fr] gap-3 px-4 py-3 text-[14px] text-[var(--text-secondary)]"
              >
                <span className="truncate text-[var(--text-primary)]">{formatLabel(row.dimensionKey, tab)}</span>
                <span className="text-right">{row.clicks.toLocaleString('es-AR')}</span>
                <span className="text-right">{row.impressions.toLocaleString('es-AR')}</span>
                <span className="text-right">{formatCtr(row.ctr)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
