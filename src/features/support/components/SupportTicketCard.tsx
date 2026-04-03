import { MessageSquareText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Badge from '@/core/components/Badge';
import { formatDateSafe } from '@/utils/formatDateSafe';
import { getPriorityLabel, getPriorityVariant, getStatusLabel, getStatusVariant } from '../support.utils';
import type { Ticket } from '../types';
import SupportTicketResponseBlock from './SupportTicketResponseBlock';

interface SupportTicketCardProps {
  onReply: (ticketId: string) => void;
  ticket: Ticket;
  userEmail: string;
}

export default function SupportTicketCard({ onReply, ticket, userEmail }: SupportTicketCardProps) {
  return (
    <article className="rounded-[22px] border border-[var(--border-default)] bg-[var(--bg-surface)]/92 p-4 shadow-2xl transition-colors hover:border-[var(--border-strong)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-medium text-[var(--text-primary)]">{ticket.title}</h3>
          <p className="mt-2 text-[13px] leading-5 text-[var(--text-secondary)]">{ticket.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-[var(--text-tertiary)]">
            <span>{formatDateSafe(ticket.created_at)}</span>
            <span className="h-1 w-1 rounded-full bg-[var(--text-disabled)]" />
            <span>{userEmail}</span>
            <span className="h-1 w-1 rounded-full bg-[var(--text-disabled)]" />
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
          <SupportTicketResponseBlock
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
            tone="signal"
          />
        ) : null}

        {ticket.respuesta_cliente ? (
          <SupportTicketResponseBlock
            content={ticket.respuesta_cliente}
            icon={<MessageSquareText className="h-4 w-4 text-[var(--success)]" strokeWidth={1.5} />}
            meta={ticket.fecha_respuesta_cliente ? formatDateSafe(ticket.fecha_respuesta_cliente) : undefined}
            title="Tu respuesta"
            tone="success"
          />
        ) : null}
      </div>

      {ticket.respuesta && ticket.status !== 'closed' ? (
        <Button
          className="mt-4 h-10 rounded-full bg-[var(--signal)] px-4 text-white hover:bg-[var(--signal-dim)]"
          type="button"
          onClick={() => onReply(ticket.id)}
        >
          <MessageSquareText className="mr-2 h-4 w-4" strokeWidth={1.5} />
          Responder
        </Button>
      ) : null}
    </article>
  );
}
