import { MessageSquareMore } from 'lucide-react';
import type { SupportAdminTicketRecord } from '@/features/support/services/ticket.service';
import type { SupportPriority, Ticket } from '../types';
import { getPriorityLabel, getStatusLabel } from '../support.utils';
import SupportResponseDetailBlock from './SupportResponseDetailBlock';
import SupportTicketResponseBlock from './SupportTicketResponseBlock';

interface SupportConversationSummaryGridProps {
  canReply: boolean;
  isAdmin: boolean;
  ticket: SupportAdminTicketRecord;
}

export default function SupportConversationSummaryGrid({
  canReply,
  isAdmin,
  ticket,
}: SupportConversationSummaryGridProps) {
  const status = (ticket.status ?? 'open') as Ticket['status'];
  const priority = (ticket.priority ?? 'medium') as SupportPriority;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full border border-[var(--support-signal-border)] bg-[var(--support-signal-glow)] px-3 py-1 text-[12px] font-medium text-[var(--support-signal)]">
          {getStatusLabel(status)}
        </span>
        <span className="rounded-full border border-[var(--support-border-default)] bg-[var(--support-bg-elevated)] px-3 py-1 text-[12px] font-medium text-[var(--support-text-secondary)]">
          Prioridad {getPriorityLabel(priority)}
        </span>
        {isAdmin && ticket.assigned_admin_id ? (
          <span className="rounded-full border border-[var(--support-border-default)] bg-[var(--support-bg-elevated)] px-3 py-1 text-[12px] font-medium text-[var(--support-text-secondary)]">
            Ticket tomado
          </span>
        ) : null}
      </div>

      <SupportResponseDetailBlock
        title={isAdmin ? 'Cliente y ticket' : 'Resumen del ticket'}
        value={
          <div className="space-y-2">
            <p className="text-[18px] font-semibold leading-6 text-[var(--support-text-primary)]">{ticket.title}</p>
            <p className="text-[13px] leading-5 text-[var(--support-text-secondary)]">
              {isAdmin
                ? 'Estas respondiendo el mismo hilo que ve el cliente dentro de Pulse.'
                : 'Cada respuesta queda dentro del mismo hilo para que el equipo siga tu caso.'}
            </p>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <SupportResponseDetailBlock
          title="Consulta original"
          value={<p className="text-sm leading-6 text-[var(--support-text-primary)]">{ticket.description}</p>}
        />
        <SupportResponseDetailBlock
          title={isAdmin ? 'Siguiente accion' : 'Que sigue'}
          value={
            <p className="text-base font-semibold text-[var(--support-text-primary)]">
              {isAdmin ? 'Responder o continuar el ticket' : 'Sumar lo que falta aclarar'}
            </p>
          }
          description={
            isAdmin
              ? canReply
                ? 'Tu respuesta se refleja al instante en el panel del cliente.'
                : 'Este ticket ya quedo asignado a otro admin.'
              : 'Tu mensaje llega directo al admin que esta llevando este ticket.'
          }
        />
        <SupportResponseDetailBlock
          title="Estado del proyecto"
          value={<p className="text-base font-semibold text-[var(--support-text-primary)]">{getStatusLabel(status)}</p>}
          description={isAdmin ? 'Lectura operativa del ticket dentro de la bandeja.' : 'Como viene hoy la conversacion con el equipo.'}
        />
        <SupportResponseDetailBlock
          title={isAdmin ? 'Ultimo movimiento' : 'Tu parte'}
          value={
            <p className="text-base font-semibold text-[var(--support-text-primary)]">
              {ticket.respuesta_cliente && isAdmin
                ? 'Cliente respondio'
                : ticket.respuesta
                  ? 'Esperando tu respuesta'
                  : 'Sin respuesta del equipo'}
            </p>
          }
          description={
            isAdmin
              ? 'Si respondes desde aqui, el cliente lo ve en tiempo real.'
              : 'Cuando el equipo responda, vas a verlo tambien desde esta burbuja.'
          }
        />
      </div>

      {ticket.respuesta ? (
        <SupportResponseDetailBlock title="Ultima respuesta del equipo">
          <SupportTicketResponseBlock
            content={ticket.respuesta}
            icon={<MessageSquareMore className="h-4 w-4 text-[var(--support-signal)]" strokeWidth={1.5} />}
            meta={ticket.respondido_por || undefined}
            title="Respuesta del equipo"
            tone="signal"
          />
        </SupportResponseDetailBlock>
      ) : null}

      {ticket.respuesta_cliente && isAdmin ? (
        <SupportResponseDetailBlock title="Ultimo mensaje del cliente">
          <SupportTicketResponseBlock
            content={ticket.respuesta_cliente}
            icon={<MessageSquareMore className="h-4 w-4 text-emerald-300" strokeWidth={1.5} />}
            title="Cliente"
            tone="success"
          />
        </SupportResponseDetailBlock>
      ) : null}
    </>
  );
}
