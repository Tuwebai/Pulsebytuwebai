import { AlertCircle, CheckCircle, Clock, Ticket } from 'lucide-react';

import type { TicketStats } from '@/features/admin/tickets/types/adminTicket.types';

interface AdminTicketsStatsProps {
  stats: TicketStats;
}

const CARDS = [
  { key: 'total', label: 'Total abierto', detail: 'conversaciones visibles', icon: Ticket, tone: 'text-sky-100 bg-sky-500/12 border-sky-400/15' },
  { key: 'open', label: 'Sin responder', detail: 'requieren primer contacto', icon: AlertCircle, tone: 'text-sky-100 bg-sky-500/12 border-sky-400/15' },
  { key: 'inProgress', label: 'En curso', detail: 'con seguimiento activo', icon: Clock, tone: 'text-amber-100 bg-amber-500/12 border-amber-400/15' },
  { key: 'resolved', label: 'Resueltos', detail: 'listos para cerrar', icon: CheckCircle, tone: 'text-emerald-100 bg-emerald-500/12 border-emerald-400/15' },
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
            className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(8,15,30,0.92))] p-5 shadow-[0_16px_36px_rgba(2,6,23,0.25)]"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-sky-400/70 via-violet-400/30 to-transparent" />
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
                <p className="font-data text-4xl font-semibold leading-none text-slate-50">{value}</p>
                <p className="text-xs text-slate-500">{card.detail}</p>
              </div>
              <div className={`rounded-2xl border p-3 ${card.tone}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
