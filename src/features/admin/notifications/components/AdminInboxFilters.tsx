import { RefreshCw, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
  isSyncing?: boolean;
  onSearchChange: (value: string) => void;
  onSelectSegment: (segment: InboxSegmentId) => void;
  onSync?: () => void;
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
  isSyncing = false,
  onSearchChange,
  onSelectSegment,
  onSync,
}: AdminInboxFiltersProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/70 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
        {SEGMENTS.map((segment) => {
          const isActive = activeSegment === segment.id;

          return (
            <button
              key={segment.id}
              type="button"
              onClick={() => onSelectSegment(segment.id)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                'border-border/70 bg-background/50 text-muted-foreground hover:bg-accent/40',
                isActive && 'border-[var(--border-signal)] text-foreground',
              )}
              style={isActive ? { backgroundColor: 'var(--signal-glow)' } : undefined}
            >
              {segment.label}
            </button>
          );
        })}
        </div>

        {onSync ? (
          <button
            type="button"
            onClick={onSync}
            disabled={isSyncing}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              'border-border/70 bg-background/50 text-muted-foreground hover:bg-accent/40 disabled:cursor-not-allowed disabled:opacity-60',
            )}
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isSyncing && 'animate-spin')} />
            {isSyncing ? 'Actualizando eventos' : 'Actualizar eventos'}
          </button>
        ) : null}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar por cliente o evento"
          className="pl-9"
        />
      </div>
    </div>
  );
}
