import { AlertTriangle, CircleDot, Clock3, FolderKanban, UserRoundX } from 'lucide-react';

import { cn } from '@/core/utils/cn';

type CounterFilterId = 'all' | 'critical' | 'unassigned' | 'in_progress' | 'resolved_today';

interface CounterItem {
  id: CounterFilterId;
  label: string;
  value: number;
  detail: string;
  icon: typeof CircleDot;
  iconClassName: string;
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
    {
      id: 'all',
      label: 'Abiertas',
      value: counts.open_total,
      detail: 'requieren revisión',
      icon: FolderKanban,
      iconClassName: 'bg-signal/15 text-signal',
    },
    {
      id: 'critical',
      label: 'Críticas',
      value: counts.critical_open,
      detail: 'impacto alto',
      icon: AlertTriangle,
      iconClassName: 'bg-red-500/15 text-red-200',
    },
    {
      id: 'unassigned',
      label: 'Sin asignar',
      value: counts.unassigned,
      detail: 'sin owner',
      icon: UserRoundX,
      iconClassName: 'bg-violet-500/15 text-violet-200',
    },
    {
      id: 'in_progress',
      label: 'En progreso',
      value: counts.in_progress,
      detail: 'seguimiento activo',
      icon: Clock3,
      iconClassName: 'bg-amber-500/15 text-amber-200',
    },
    {
      id: 'resolved_today',
      label: 'Resueltas hoy',
      value: counts.resolved_today,
      detail: 'cierre reciente',
      icon: CircleDot,
      iconClassName: 'bg-emerald-500/15 text-emerald-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeCounter === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              'min-w-0 rounded-[24px] border p-4 text-left shadow-[0_18px_40px_rgba(2,6,23,0.24)] transition-colors sm:p-5',
              isActive
                ? 'border-sky-400/25 bg-[linear-gradient(180deg,rgba(59,158,245,0.10),rgba(8,15,30,0.92))]'
                : 'border-white/10 bg-[var(--bg-surface)]/92 hover:border-white/15',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${item.iconClassName}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Resumen
              </p>
            </div>

            <div className="mt-4 space-y-1.5">
              <p className="text-sm font-medium text-slate-100">{item.label}</p>
              <p className="font-data text-[clamp(2.2rem,3vw,2.8rem)] font-light leading-none tracking-tight text-slate-50">
                {item.value}
              </p>
              <p className="text-xs leading-5 text-slate-400">{item.detail}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
