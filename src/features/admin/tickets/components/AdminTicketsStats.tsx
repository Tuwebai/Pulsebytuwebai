import { AlertCircle, CheckCircle, Clock, Ticket } from 'lucide-react';

import type { TicketStats } from '@/features/admin/tickets/types/adminTicket.types';

interface AdminTicketsStatsProps {
  stats: TicketStats;
}

export function AdminTicketsStats({ stats }: AdminTicketsStatsProps) {
  const cards = [
    {
      icon: Ticket,
      value: stats.total.toLocaleString('es-AR'),
      label: 'Tickets visibles',
      detail: 'base de trabajo',
      iconClassName: 'bg-signal/15 text-signal',
      detailClassName: 'text-slate-400',
      valueClassName: 'text-[clamp(2.4rem,4vw,3.4rem)]',
    },
    {
      icon: AlertCircle,
      value: stats.open.toLocaleString('es-AR'),
      label: 'Sin responder',
      detail: 'requieren primer contacto',
      iconClassName: 'bg-sky-500/15 text-sky-100',
      detailClassName: 'text-slate-400',
      valueClassName: 'text-[clamp(2.4rem,4vw,3.4rem)]',
    },
    {
      icon: Clock,
      value: stats.inProgress.toLocaleString('es-AR'),
      label: 'En curso',
      detail: 'seguimiento activo',
      iconClassName: 'bg-amber-500/15 text-amber-200',
      detailClassName: 'text-slate-400',
      valueClassName: 'text-[clamp(2.4rem,4vw,3.4rem)]',
    },
    {
      icon: CheckCircle,
      value: stats.resolved.toLocaleString('es-AR'),
      label: 'Resueltos',
      detail: 'listos para cerrar',
      iconClassName: 'bg-emerald-500/15 text-emerald-200',
      detailClassName: 'text-slate-400',
      valueClassName: 'text-[clamp(2.4rem,4vw,3.4rem)]',
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <section
            key={card.label}
            className="min-w-0 rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/92 p-4 shadow-[0_18px_40px_rgba(2,6,23,0.24)] transition-colors hover:border-white/15 sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${card.iconClassName}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Resumen
              </p>
            </div>

            <div className="mt-4 min-w-0 space-y-1.5">
              <p className="text-sm font-medium text-slate-100">{card.label}</p>
              <p
                className={`min-w-0 overflow-hidden text-ellipsis font-data font-light leading-none tracking-tight text-slate-50 ${card.valueClassName}`}
              >
                {card.value}
              </p>
              <p className={`text-xs leading-5 ${card.detailClassName}`}>{card.detail}</p>
            </div>
          </section>
        );
      })}
    </div>
  );
}
