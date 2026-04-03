import { Plus, X } from 'lucide-react';
import { PulseLogo } from '@/core/components';
import type { SupportAdminTicketRecord } from '@/features/support/services/ticket.service';
import type { SupportConversationSummary } from '@/features/support/ticketMessages.types';
import SupportConversationListItem from './SupportConversationListItem';

interface SupportConversationListViewProps {
  conversations: SupportConversationSummary[];
  isAdmin: boolean;
  selectedTicketId: string | null;
  tickets: SupportAdminTicketRecord[];
  onClose: () => void;
  onOpenNewTicket: () => void;
  onSelectTicket: (ticketId: string) => void;
}

export default function SupportConversationListView({
  conversations,
  isAdmin,
  selectedTicketId,
  tickets,
  onClose,
  onOpenNewTicket,
  onSelectTicket,
}: SupportConversationListViewProps) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--signal-glow)] text-[var(--signal)]">
            <PulseLogo size={18} variant="signal" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
              {isAdmin ? 'Pulse admin' : 'Pulse soporte'}
            </p>
            <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">Conversaciones</h2>
          </div>
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

      <div className="relative min-h-0 flex-1 overflow-y-auto bg-[var(--bg-base)] px-3 py-3">
        {conversations.length > 0 ? (
          <div className="space-y-2 pb-20">
            {conversations.map((conversation) => {
              const ticket = tickets.find((item) => item.id === conversation.ticketId);

              if (!ticket) {
                return null;
              }

              return (
                <SupportConversationListItem
                  key={conversation.ticketId}
                  active={selectedTicketId === conversation.ticketId}
                  conversation={conversation}
                  onSelect={onSelectTicket}
                />
              );
            })}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center">
            <p className="text-[13px] leading-6 text-[var(--text-secondary)]">
              {isAdmin ? 'Todavia no tienes conversaciones asignadas.' : 'Cuando abras tu primer ticket, aparecera aqui.'}
            </p>
          </div>
        )}

        {!isAdmin ? (
          <button
            aria-label="Crear nuevo ticket"
            className="absolute bottom-4 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--signal)] text-white shadow-[var(--shadow-modal)] transition-transform hover:scale-[1.02] hover:bg-[var(--signal-dim)]"
            type="button"
            onClick={onOpenNewTicket}
          >
            <Plus className="h-5 w-5" strokeWidth={2} />
          </button>
        ) : null}
      </div>
    </>
  );
}
