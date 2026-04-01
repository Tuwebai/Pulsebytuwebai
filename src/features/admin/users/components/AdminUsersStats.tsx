import { ShieldCheck, UserPlus, Users } from 'lucide-react';

import type { AdminUsersFilterId } from '@/features/admin/users/constants/adminUsersFilters';

interface AdminUsersStatsProps {
  clientUsers: number;
  adminUsers: number;
  filterCounts: Record<AdminUsersFilterId, number>;
}

export function AdminUsersStats({
  clientUsers,
  adminUsers,
  filterCounts,
}: AdminUsersStatsProps) {
  const cards = [
    {
      label: 'Clientes activos',
      value: clientUsers,
      detail: `${filterCounts['with-access']} con acceso Pulse`,
      icon: Users,
      iconClassName: 'bg-signal/15 text-signal',
    },
    {
      label: 'Equipo admin',
      value: adminUsers,
      detail: 'operación interna',
      icon: ShieldCheck,
      iconClassName: 'bg-violet-500/15 text-violet-300',
    },
    {
      label: 'Altas del mes',
      value: filterCounts['new-this-month'],
      detail: `${filterCounts['deletion-requests']} bajas solicitadas`,
      icon: UserPlus,
      iconClassName: 'bg-emerald-500/15 text-emerald-300',
    },
  ] as const;

  return (
    <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <article
            key={card.label}
            className="rounded-[22px] border border-white/10 bg-[var(--bg-surface)]/92 px-4 py-4 shadow-[0_14px_30px_rgba(2,6,23,0.22)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-2xl ${card.iconClassName}`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Resumen
              </p>
            </div>

            <p className="mt-4 text-sm font-medium text-slate-100">{card.label}</p>
            <p className="mt-1 font-data text-[clamp(2.2rem,3vw,2.8rem)] font-light leading-none tracking-tight text-slate-50">
              {card.value}
            </p>
            <p className="mt-2 text-xs text-slate-400">{card.detail}</p>
          </article>
        );
      })}
    </section>
  );
}
