import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  MessageSquare,
  Tag,
  Ticket,
  Trash2,
  User,
  XCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AdminTicket } from '@/features/admin/tickets/types/adminTicket.types';
import {
  getPriorityLabel,
  getPriorityTone,
  getStatusLabel,
  getStatusTone,
  getTicketContact,
  getTicketDate,
  getTicketDescription,
  getTicketStatusValue,
  getTicketTitle,
  normalizeTicketStatus,
} from '@/features/admin/tickets/utils/adminTicket.utils';

interface AdminTicketsListProps {
  tickets: AdminTicket[];
  onDelete: (ticketId: string) => void;
  onEdit: (ticket: AdminTicket) => void;
  onRespond: (ticket: AdminTicket) => void;
  onStatusChange: (ticketId: string, newStatus: string) => void;
}

function StatusIcon({ status }: { status: string }) {
  switch (normalizeTicketStatus(status)) {
    case 'open':
      return <AlertCircle className="h-3.5 w-3.5" />;
    case 'in_progress':
      return <Clock className="h-3.5 w-3.5" />;
    case 'resolved':
      return <CheckCircle className="h-3.5 w-3.5" />;
    case 'closed':
      return <XCircle className="h-3.5 w-3.5" />;
    default:
      return <MessageSquare className="h-3.5 w-3.5" />;
  }
}

export function AdminTicketsList({
  tickets,
  onDelete,
  onEdit,
  onRespond,
  onStatusChange,
}: AdminTicketsListProps) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-white/10 bg-[var(--bg-surface)]/92 shadow-[0_18px_40px_rgba(2,6,23,0.24)]">
      <div className="border-b border-white/10 px-5 py-4 sm:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Bandeja activa</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-50">Tickets ({tickets.length})</h2>
      </div>

      <div className="p-4 sm:p-5">
        <ScrollArea className="h-[620px] pr-3">
          <div className="space-y-4">
            {tickets.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-white/10 bg-[var(--bg-base)]/55 px-6 py-14 text-center">
                <Ticket className="mx-auto mb-4 h-12 w-12 text-slate-500" />
                <p className="text-lg font-medium text-slate-100">No encontramos tickets con esos filtros</p>
                <p className="mt-2 text-sm text-slate-400">Probá otra combinación para volver a enfocarte en lo importante.</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <article
                  key={ticket.id}
                  className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(8,15,30,0.88))] p-5 shadow-[0_14px_30px_rgba(2,6,23,0.20)] transition hover:border-sky-400/20"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1 space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-slate-50">{getTicketTitle(ticket)}</h3>
                        <Badge className={`gap-1.5 border px-3 py-1 ${getStatusTone(getTicketStatusValue(ticket))}`}>
                          <StatusIcon status={getTicketStatusValue(ticket)} />
                          {getStatusLabel(getTicketStatusValue(ticket))}
                        </Badge>
                        <Badge className={`border px-3 py-1 ${getPriorityTone(ticket.priority)}`}>
                          {getPriorityLabel(ticket.priority)}
                        </Badge>
                      </div>

                      {getTicketDescription(ticket) ? (
                        <p className="max-w-3xl text-sm leading-6 text-slate-300">{getTicketDescription(ticket)}</p>
                      ) : null}

                      <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-2"><User className="h-3.5 w-3.5" />{getTicketContact(ticket)}</span>
                        {ticket.category ? <span className="flex items-center gap-2"><Tag className="h-3.5 w-3.5" />{ticket.category}</span> : null}
                        <span className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" />{getTicketDate(ticket)}</span>
                      </div>

                      <div className="grid gap-3 lg:grid-cols-2">
                        {ticket.respuesta ? (
                          <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-200">Respuesta del equipo</p>
                            <p className="mt-2 text-sm leading-6 text-slate-200">{ticket.respuesta}</p>
                          </div>
                        ) : null}

                        {ticket.respuesta_cliente ? (
                          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">Última respuesta del cliente</p>
                            <p className="mt-2 text-sm leading-6 text-slate-200">{ticket.respuesta_cliente}</p>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <aside className="flex w-full flex-col gap-3 rounded-[20px] border border-white/10 bg-[var(--bg-base)]/70 p-4 xl:w-[250px] xl:shrink-0">
                      <div className="space-y-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Estado del ticket</p>
                        <Select value={getTicketStatusValue(ticket)} onValueChange={(value) => onStatusChange(ticket.id, value)}>
                          <SelectTrigger className="border-white/10 bg-slate-900 text-slate-100">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-white/10 bg-[var(--bg-elevated)] text-slate-100">
                            <SelectItem value="abierto">Abierto</SelectItem>
                            <SelectItem value="en_progreso">En progreso</SelectItem>
                            <SelectItem value="resuelto">Resuelto</SelectItem>
                            <SelectItem value="cerrado">Cerrado</SelectItem>
                            <SelectItem value="respondido">Respondido</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <Button variant="outline" onClick={() => onRespond(ticket)} className="border-emerald-500/20 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" onClick={() => onEdit(ticket)} className="border-sky-500/20 bg-sky-500/10 text-sky-100 hover:bg-sky-500/20">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" onClick={() => onDelete(ticket.id)} className="border-rose-500/20 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </aside>
                  </div>
                </article>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </section>
  );
}
