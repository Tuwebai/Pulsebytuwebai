import { AlertCircle, CheckCircle, Clock, Ticket } from 'lucide-react';

import type { TicketStats } from '@/features/admin/tickets/types/adminTicket.types';

interface AdminTicketsStatsProps {
  stats: TicketStats;
}

const CARDS = [
  { key: 'total', label: 'Total', icon: Ticket, tone: 'text-slate-50 bg-sky-500/15' },
  { key: 'open', label: 'Abiertos', icon: AlertCircle, tone: 'text-sky-200 bg-sky-500/12' },
  { key: 'inProgress', label: 'En progreso', icon: Clock, tone: 'text-amber-200 bg-amber-500/12' },
  { key: 'resolved', label: 'Resueltos', icon: CheckCircle, tone: 'text-emerald-200 bg-emerald-500/12' },
] as const;

export function AdminTicketsStats({ stats }: AdminTicketsStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {CARDS.map((card) => {
        const Icon = card.icon;
        const value = stats[card.key];

        return (
          <section
            key={card.key}
            className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-[0_12px_30px_rgba(2,6,23,0.28)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
                <p className="font-data text-4xl font-semibold text-slate-50">{value}</p>
              </div>
              <div className={`rounded-2xl p-3 ${card.tone}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
