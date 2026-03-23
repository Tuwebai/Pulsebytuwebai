import { MessageSquareText, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Badge from '@/core/components/Badge';
import Skeleton from '@/core/components/Skeleton';
import { formatDateSafe } from '@/utils/formatDateSafe';
import { getPriorityLabel, getPriorityVariant, getStatusLabel, getStatusVariant } from '../support.utils';
import type { Ticket } from '../types';

interface SupportTicketsPanelProps {
  loading: boolean;
  error: string | null;
  tickets: Ticket[];
  userEmail: string;
  onReply: (ticketId: string) => void;
  onRetry: () => void;
}

function TicketResponseBlock({
  title,
  content,
  meta,
  color,
  icon
}: {
  title: string;
  content: string;
  meta?: string;
  color: 'signal' | 'success';
  icon: React.ReactNode;
}) {
  const colors =
    color === 'signal'
      ? 'border-[color:rgba(59,158,245,0.28)] bg-[color:rgba(59,158,245,0.10)]'
      : 'border-[color:rgba(34,197,94,0.28)] bg-[color:rgba(34,197,94,0.10)]';

  return (
    <div className={`rounded-[16px] border px-4 py-3 ${colors}`}>
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-[13px] font-medium text-[var(--text-primary)]">{title}</p>
      </div>
      <p className="mt-2 text-[13px] leading-5 text-[var(--text-secondary)]">{content}</p>
      {meta ? <p className="mt-2 text-[12px] text-[var(--text-tertiary)]">{meta}</p> : null}
    </div>
  );
}

export default function SupportTicketsPanel({
  loading,
  error,
  tickets,
  userEmail,
  onReply,
  onRetry
}: SupportTicketsPanelProps) {
  return (
    <section className="rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)]">
      <div className="border-b border-[var(--border-subtle)] px-5 py-4">
        <h2 className="text-[16px] font-medium text-[var(--text-primary)]">Historial de tickets</h2>
        <p className="mt-1 text-[13px] text-[var(--text-secondary)]">Seguí el estado y la conversación con el equipo.</p>
      </div>

      <div className="px-5 py-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
                <Skeleton height="16px" rounded="sm" width="180px" />
                <div className="mt-3 space-y-2">
                  <Skeleton height="14px" rounded="sm" width="100%" />
                  <Skeleton height="14px" rounded="sm" width="85%" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!loading && error ? (
          <div className="rounded-[18px] border border-[color:rgba(239,68,68,0.28)] bg-[color:rgba(239,68,68,0.10)] px-4 py-5">
            <p className="text-[14px] font-medium text-[var(--text-primary)]">No pudimos cargar tus tickets</p>
            <p className="mt-1 text-[13px] text-[var(--text-secondary)]">{error}</p>
            <Button
              className="mt-4 rounded-[10px] bg-[var(--signal)] text-white hover:bg-[var(--signal-dim)]"
              type="button"
              onClick={onRetry}
            >
              <RefreshCcw className="mr-2 h-4 w-4" strokeWidth={1.5} />
              Reintentar
            </Button>
          </div>
        ) : null}

        {!loading && !error && tickets.length === 0 ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bg-elevated)]">
              <MessageSquareText className="h-7 w-7 text-[var(--text-tertiary)]" strokeWidth={1.5} />
            </div>
            <p className="mt-4 text-[16px] font-medium text-[var(--text-primary)]">No tenés tickets de soporte</p>
            <p className="mt-1 max-w-[320px] text-[13px] leading-5 text-[var(--text-secondary)]">
              Cuando envíes tu primera consulta, la vas a ver acá con su estado y respuestas.
            </p>
          </div>
        ) : null}

        {!loading && !error && tickets.length > 0 ? (
          <div className="divide-y divide-[var(--border-subtle)]">
            {tickets.map((ticket) => (
              <article className="py-4 first:pt-0 last:pb-0" key={ticket.id}>
                <div className="rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-4 transition-colors hover:bg-[var(--bg-subtle)]">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[15px] font-medium text-[var(--text-primary)]">{ticket.title}</h3>
                      <p className="mt-2 text-[13px] leading-5 text-[var(--text-secondary)]">{ticket.description}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-[var(--text-tertiary)]">
                        <span>{formatDateSafe(ticket.created_at)}</span>
                        <span className="h-1 w-1 rounded-full bg-[var(--text-tertiary)]" />
                        <span>{userEmail}</span>
                        <span className="h-1 w-1 rounded-full bg-[var(--text-tertiary)]" />
                        <span className="font-data">#{ticket.id.slice(-6).toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge size="sm" variant={getPriorityVariant(ticket.priority)}>
                        {getPriorityLabel(ticket.priority)}
                      </Badge>
                      <Badge size="sm" variant={getStatusVariant(ticket.status)}>
                        {getStatusLabel(ticket.status)}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {ticket.respuesta ? (
                      <TicketResponseBlock
                        color="signal"
                        content={ticket.respuesta}
                        icon={<MessageSquareText className="h-4 w-4 text-[var(--signal)]" strokeWidth={1.5} />}
                        meta={
                          ticket.respondido_por
                            ? `Respondido por ${ticket.respondido_por}${ticket.fecha_respuesta ? ` · ${formatDateSafe(ticket.fecha_respuesta)}` : ''}`
                            : ticket.fecha_respuesta
                              ? formatDateSafe(ticket.fecha_respuesta)
                              : undefined
                        }
                        title="Respuesta del equipo"
                      />
                    ) : null}

                    {ticket.respuesta_cliente ? (
                      <TicketResponseBlock
                        color="success"
                        content={ticket.respuesta_cliente}
                        icon={<MessageSquareText className="h-4 w-4 text-[var(--success)]" strokeWidth={1.5} />}
                        meta={ticket.fecha_respuesta_cliente ? formatDateSafe(ticket.fecha_respuesta_cliente) : undefined}
                        title="Tu respuesta"
                      />
                    ) : null}
                  </div>

                  {ticket.respuesta && ticket.status !== 'closed' ? (
                    <Button
                      className="mt-4 rounded-[10px] bg-[var(--signal)] text-white hover:bg-[var(--signal-dim)]"
                      type="button"
                      onClick={() => onReply(ticket.id)}
                    >
                      <MessageSquareText className="mr-2 h-4 w-4" strokeWidth={1.5} />
                      Responder
                    </Button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
