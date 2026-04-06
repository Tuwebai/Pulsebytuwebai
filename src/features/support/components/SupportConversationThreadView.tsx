import { useEffect, useRef } from 'react';
import { ArrowLeft, Send, X } from 'lucide-react';
import { Button } from '@/core/ui/button';
import { Textarea } from '@/core/ui/textarea';
import type { SupportAdminTicketRecord } from '@/features/support/services/ticket.service';
import type { SupportConversationSummary, TicketMessage } from '@/features/support/ticketMessages.types';
import { Avatar, AvatarFallback, AvatarImage } from '@/core/ui/avatar';
import { getIdentityInitials } from '@/lib/identity/userIdentity';
import SupportMessageBubble from './SupportMessageBubble';

interface SupportConversationThreadViewProps {
  canClientSend: boolean;
  canReply: boolean;
  fieldClassName: string;
  focusNonce: number;
  isSubmitting: boolean;
  isAdmin: boolean;
  messages: TicketMessage[];
  responseText: string;
  selectedConversation: SupportConversationSummary | null;
  ticket: SupportAdminTicketRecord;
  clientRemainingMessages: number;
  onBack: () => void;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function SupportConversationThreadView({
  canClientSend,
  canReply,
  clientRemainingMessages,
  fieldClassName,
  focusNonce,
  isSubmitting,
  isAdmin,
  messages,
  responseText,
  selectedConversation,
  ticket,
  onBack,
  onChange,
  onClose,
  onSubmit,
}: SupportConversationThreadViewProps) {
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const replyEnabled = isAdmin ? canReply : canReply && canClientSend;

  useEffect(() => {
    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  }, [focusNonce, messages.length]);

  return (
    <>
      <div className="flex items-center gap-3 border-b border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-4">
        <button
          aria-label="Volver a conversaciones"
          className="rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] p-2 text-[var(--text-secondary)] transition-colors hover:border-[var(--signal-border)] hover:text-[var(--text-primary)]"
          type="button"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <Avatar className="h-10 w-10 border border-[var(--border-default)]">
          <AvatarImage
            alt={selectedConversation?.participantName || ticket.title}
            className="object-cover"
            src={selectedConversation?.participantAvatarUrl ?? undefined}
          />
          <AvatarFallback className="bg-[var(--bg-elevated)] text-[11px] font-semibold text-[var(--text-primary)]">
            {getIdentityInitials(selectedConversation?.participantName, selectedConversation?.participantEmail ?? undefined)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-medium text-[var(--text-secondary)]">
            {selectedConversation?.assignedAdminName || 'Equipo Pulse'}
          </p>
          <p className="truncate text-[15px] font-semibold text-[var(--text-primary)]">{ticket.title}</p>
        </div>
        <button
          aria-label="Cerrar chat"
          className="rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] p-2 text-[var(--text-secondary)] transition-colors hover:border-[var(--signal-border)] hover:text-[var(--text-primary)]"
          type="button"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--bg-base)] px-4 py-4">
        <div className="space-y-3">
          {messages.map((message) => (
            <SupportMessageBubble
              key={message.id}
              isOwn={message.sender_role === (isAdmin ? 'admin' : 'client')}
              message={message}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-[var(--border-default)] bg-[var(--bg-surface)] p-3">
        <div className="flex items-end gap-2">
          <Textarea
            ref={inputRef}
            className={`${fieldClassName} min-h-[52px] max-h-[120px] resize-none rounded-[20px]`}
            disabled={!replyEnabled || isSubmitting}
            placeholder={replyEnabled ? 'Escribe tu mensaje...' : 'Espera la respuesta del equipo para continuar.'}
            value={responseText}
            onChange={(event) => onChange(event.target.value)}
          />
          <Button
            className="h-11 shrink-0 rounded-full bg-[var(--signal)] px-4 text-white hover:bg-[var(--signal-dim)]"
            disabled={!replyEnabled || !responseText.trim() || isSubmitting}
            type="button"
            onClick={onSubmit}
          >
            <Send className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        </div>
        {!isAdmin ? (
          <p className="mt-2 px-1 text-[11px] text-[var(--text-tertiary)]">
            {replyEnabled ? `Mensajes seguidos disponibles: ${clientRemainingMessages}` : 'Esperando respuesta del equipo'}
          </p>
        ) : null}
      </div>
    </>
  );
}
