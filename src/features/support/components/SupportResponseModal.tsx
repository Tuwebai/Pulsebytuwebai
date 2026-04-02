import { MessageSquareMore } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getPriorityLabel, getStatusLabel } from '../support.utils';
import type { Ticket } from '../types';
import SupportDialogShell from './SupportDialogShell';
import SupportResponseDetailBlock from './SupportResponseDetailBlock';
import SupportTicketResponseBlock from './SupportTicketResponseBlock';

interface SupportResponseModalProps {
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  responseText: string;
  ticket: Ticket | null;
}

export default function SupportResponseModal({
  onChange,
  onClose,
  onSubmit,
  responseText,
  ticket,
}: SupportResponseModalProps) {
  if (!ticket) return null;

  return (
    <SupportDialogShell
      ariaDescribedBy="support-response-description"
      description="Tu mensaje se suma al mismo ticket para que el equipo responda con contexto y sin perder el hilo."
      icon={MessageSquareMore}
      kicker="Pulse · soporte"
      open={Boolean(ticket)}
      title="Seguimos la conversación"
      onOpenChange={(open) => !open && onClose()}
      footer={
        <>
          <Button className="border-white/10 bg-transparent text-slate-300 hover:bg-white/[0.04]" type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="bg-signal text-white hover:bg-[var(--signal-dim)]" disabled={!responseText.trim()} type="button" onClick={onSubmit}>
            Enviar respuesta
          </Button>
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-signal/20 bg-signal/10 px-3 py-1 text-[12px] font-medium text-signal">
          {getStatusLabel(ticket.status)}
        </span>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[12px] font-medium text-slate-300">
          Prioridad {getPriorityLabel(ticket.priority)}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SupportResponseDetailBlock
          title="Ticket"
          value={<p className="text-lg font-semibold">{ticket.title}</p>}
          description="Esta es la consulta que abriste y que hoy sigue en conversación con el equipo."
        />
        <SupportResponseDetailBlock
          title="Qué sigue"
          value={<p className="text-base font-semibold text-slate-100">Respondé lo que falte aclarar</p>}
          description="Si necesitás sumar contexto o confirmar algo, este mensaje queda dentro del mismo hilo."
        />
        <SupportResponseDetailBlock
          className="md:col-span-2"
          title="Consulta original"
          value={<p className="text-sm leading-6 text-slate-100">{ticket.description}</p>}
        />
        {ticket.respuesta ? (
          <SupportResponseDetailBlock className="md:col-span-2" title="Última respuesta del equipo">
            <SupportTicketResponseBlock
              content={ticket.respuesta}
              icon={<MessageSquareMore className="h-4 w-4 text-signal" strokeWidth={1.5} />}
              meta={ticket.respondido_por || undefined}
              title="Respuesta del equipo"
              tone="signal"
            />
          </SupportResponseDetailBlock>
        ) : null}
        <SupportResponseDetailBlock className="md:col-span-2" title="Tu respuesta">
          <Textarea
            className="min-h-[150px] resize-none border-white/10 bg-[var(--cliente-bg-surface)] text-slate-100 placeholder:text-slate-500 focus-visible:border-signal focus-visible:ring-2 focus-visible:ring-[var(--signal-glow)] focus-visible:ring-offset-0"
            id="support-response"
            placeholder="Escribí la aclaración o el dato que querés sumar al ticket."
            required
            rows={5}
            value={responseText}
            onChange={(event) => onChange(event.target.value)}
          />
        </SupportResponseDetailBlock>
      </div>
    </SupportDialogShell>
  );
}
