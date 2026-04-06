import { Search } from 'lucide-react';

import { Input } from '@/core/ui/input';
import { cn } from '@/lib/utils';

export type InboxSegmentId =
  | 'all'
  | 'critical'
  | 'unassigned'
  | 'payments'
  | 'support'
  | 'domain'
  | 'approvals';

interface AdminInboxFiltersProps {
  activeSegment: InboxSegmentId;
  search: string;
  onSearchChange: (value: string) => void;
  onSelectSegment: (segment: InboxSegmentId) => void;
}

const SEGMENTS: Array<{ id: InboxSegmentId; label: string }> = [
  { id: 'all', label: 'Todas' },
  { id: 'critical', label: 'Críticas' },
  { id: 'unassigned', label: 'Sin owner' },
  { id: 'payments', label: 'Pagos' },
  { id: 'support', label: 'Soporte' },
  { id: 'domain', label: 'Dominio' },
  { id: 'approvals', label: 'Aprobaciones' },
];

export function AdminInboxFilters({
  activeSegment,
  search,
  onSearchChange,
  onSelectSegment,
}: AdminInboxFiltersProps) {
  return (
    <section className="rounded-[22px] border border-white/10 bg-[var(--bg-surface)]/92 px-4 py-4 shadow-[0_14px_30px_rgba(2,6,23,0.22)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
        Vista de trabajo
      </p>
      <p className="mt-1 text-sm text-slate-300">
        Filtrá rápido los eventos que necesita revisar el equipo.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {SEGMENTS.map((segment) => {
            const isActive = activeSegment === segment.id;

            return (
              <button
                key={segment.id}
                type="button"
                onClick={() => onSelectSegment(segment.id)}
                className={cn(
                  'rounded-full border px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-sky-400/30 bg-sky-500/10 text-sky-100'
                    : 'border-white/10 bg-[var(--bg-base)] text-slate-300 hover:border-white/15 hover:text-slate-100',
                )}
              >
                {segment.label}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar por cliente, evento o impacto"
            className="h-12 border-white/10 bg-[var(--bg-base)] pl-9 text-slate-100 placeholder:text-slate-500"
          />
        </div>
      </div>
    </section>
  );
}
