import { AlertTriangle, CircleDot, Clock3, FolderKanban, UserRoundX } from 'lucide-react';
import { cn } from '@/lib/utils';

type CounterFilterId = 'all' | 'critical' | 'unassigned' | 'in_progress' | 'resolved_today';

interface CounterItem {
  id: CounterFilterId;
  label: string;
  value: number;
  icon: typeof CircleDot;
  active?: boolean;
}

interface AdminInboxCountersProps {
  counts: {
    open_total: number;
    critical_open: number;
    unassigned: number;
    in_progress: number;
    resolved_today: number;
  };
  activeCounter: CounterFilterId;
  onSelect: (counterId: CounterFilterId) => void;
}

export function AdminInboxCounters({
  counts,
  activeCounter,
  onSelect,
}: AdminInboxCountersProps) {
  const items: CounterItem[] = [
    { id: 'all', label: 'Abiertas', value: counts.open_total, icon: FolderKanban },
    { id: 'critical', label: 'Críticas', value: counts.critical_open, icon: AlertTriangle },
    { id: 'unassigned', label: 'Sin owner', value: counts.unassigned, icon: UserRoundX },
    { id: 'in_progress', label: 'En progreso', value: counts.in_progress, icon: Clock3 },
    { id: 'resolved_today', label: 'Resueltas hoy', value: counts.resolved_today, icon: CircleDot },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {items.map((item) => {
        const isCritical = item.id === 'critical';
        const isActive = activeCounter === item.id;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              'rounded-2xl border px-4 py-3 text-left transition-colors',
              'bg-card text-card-foreground hover:border-border hover:bg-accent/30',
              isActive && 'border-[var(--border-signal)]',
              isCritical && 'border-[var(--danger)]/20',
            )}
            style={
              isActive
                ? {
                    backgroundColor: isCritical ? 'var(--danger-dim)' : 'var(--signal-glow)',
                  }
                : undefined
            }
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
              <Icon
                className="h-4 w-4"
                style={{ color: isCritical ? 'var(--danger)' : 'var(--text-secondary)' }}
              />
            </div>
            <div
              className="text-2xl font-semibold tracking-tight"
              style={{ color: isCritical ? 'var(--danger)' : 'var(--text-primary)' }}
            >
              {item.value}
            </div>
          </button>
        );
      })}
    </div>
  );
}
