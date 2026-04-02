import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PulseLogo } from '@/core/components';
import type { SupportAdminTicketRecord } from '@/features/support/services/ticket.service';
import type { SupportChatScope } from '../supportChat.events';
import SupportResponseDetailBlock from './SupportResponseDetailBlock';
import SupportConversationSummaryGrid from './SupportConversationSummaryGrid';

interface SupportConversationPanelProps {
  canReply: boolean;
  focusNonce: number;
  open: boolean;
  responseText: string;
  scope: SupportChatScope;
  ticket: SupportAdminTicketRecord | null;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function SupportConversationPanel({
  canReply,
  focusNonce,
  open,
  responseText,
  scope,
  ticket,
  onChange,
  onClose,
  onSubmit,
}: SupportConversationPanelProps) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const isAdmin = scope === 'admin';

  useEffect(() => {
    if (!open) {
      return;
    }

    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [focusNonce, open]);

  if (!open) {
    return null;
  }

  return (
    <aside
      className="fixed inset-x-3 bottom-20 z-40 max-h-[78vh] overflow-hidden rounded-[var(--support-card-radius)] border border-[var(--support-border-default)] bg-[var(--support-bg-surface)] shadow-[var(--support-shadow-modal)] md:inset-x-auto md:bottom-24 md:right-6 md:w-[460px] lg:w-[520px]"
      role="dialog"
      aria-label={isAdmin ? 'Chat de soporte admin' : 'Chat de soporte'}
    >
      <div className="border-b border-[var(--support-border-default)] bg-[var(--support-hero-bg)] px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--support-signal-glow)] text-[var(--support-signal)]">
              <PulseLogo size={18} variant="signal" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--support-text-tertiary)]">
                {isAdmin ? 'Pulse admin · soporte' : 'Pulse · soporte'}
              </p>
              <h2 className="mt-1 text-[20px] font-semibold leading-tight text-[var(--support-text-primary)] sm:text-[22px]">
                {isAdmin ? 'Conversacion activa' : 'Seguimos la conversacion'}
              </h2>
              <p className="mt-1 text-[13px] leading-5 text-[var(--support-text-secondary)]">
                {isAdmin
                  ? 'Responde sin salir del panel y manten el hilo ordenado.'
                  : 'Tu mensaje sigue dentro del mismo ticket para no perder contexto.'}
              </p>
            </div>
          </div>

          <button
            aria-label="Cerrar conversacion"
            className="rounded-full border border-[var(--support-border-default)] bg-[var(--support-bg-elevated)] p-2 text-[var(--support-text-secondary)] transition-colors hover:border-[var(--support-signal-border)] hover:text-[var(--support-text-primary)]"
            type="button"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
        {ticket ? (
          <>
            <SupportConversationSummaryGrid canReply={canReply} isAdmin={isAdmin} ticket={ticket} />

            <SupportResponseDetailBlock title={isAdmin ? 'Responder' : 'Tu respuesta'}>
              <Textarea
                ref={inputRef}
                className="min-h-[104px] resize-none border-[var(--support-border-default)] bg-[var(--support-bg-surface)] text-[var(--support-text-primary)] placeholder:text-[var(--support-text-tertiary)] focus-visible:border-[var(--support-signal)] focus-visible:ring-2 focus-visible:ring-[var(--support-signal-glow)] focus-visible:ring-offset-0"
                disabled={!canReply}
                placeholder={
                  canReply
                    ? isAdmin
                      ? 'Explica que reviso el equipo y cual es el siguiente paso.'
                      : 'Escribe la aclaracion o el dato que quieres sumar al ticket.'
                    : 'Este ticket ya esta asignado a otro admin.'
                }
                value={responseText}
                onChange={(event) => onChange(event.target.value)}
              />
            </SupportResponseDetailBlock>
          </>
        ) : (
          <SupportResponseDetailBlock
            title={isAdmin ? 'Bandeja vacia' : 'Sin conversacion activa'}
            value={<p className="text-base font-semibold text-[var(--support-text-primary)]">Todavia no hay un hilo abierto</p>}
            description={
              isAdmin
                ? 'Cuando entre un ticket nuevo o un cliente responda, vas a poder continuarlo desde esta burbuja.'
                : 'Cuando el equipo responda o quieras retomar un ticket, lo vas a poder hacer desde esta burbuja.'
            }
          />
        )}
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-[var(--support-border-default)] px-4 py-3 sm:flex-row sm:justify-end sm:px-5">
        <Button
          className="border-[var(--support-border-default)] bg-transparent text-[var(--support-text-secondary)] hover:bg-[var(--support-bg-elevated)]"
          type="button"
          variant="outline"
          onClick={onClose}
        >
          Cerrar
        </Button>
        <Button
          className="bg-[var(--support-signal)] text-white hover:bg-[var(--support-signal-dim)]"
          disabled={!ticket || !canReply || !responseText.trim()}
          type="button"
          onClick={onSubmit}
        >
          Enviar respuesta
        </Button>
      </div>
    </aside>
  );
}
