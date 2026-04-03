import type { SupportAdminTicketRecord } from '@/features/support/services/ticket.service';
import type { SupportConversationSummary, TicketMessage } from '@/features/support/ticketMessages.types';
import type { SupportDraftState } from '@/features/support';
import type { SupportChatScope } from '../supportChat.events';
import SupportConversationComposerView from './SupportConversationComposerView';
import SupportConversationListView from './SupportConversationListView';
import SupportConversationThreadView from './SupportConversationThreadView';

interface SupportConversationPanelProps {
  canClientSend: boolean;
  canReply: boolean;
  clientRemainingMessages: number;
  conversations: SupportConversationSummary[];
  createTicketOpen: boolean;
  draft: SupportDraftState;
  focusNonce: number;
  messages: TicketMessage[];
  open: boolean;
  responseText: string;
  scope: SupportChatScope;
  selectedConversation: SupportConversationSummary | null;
  ticket: SupportAdminTicketRecord | null;
  tickets: SupportAdminTicketRecord[];
  onChange: (value: string) => void;
  onClose: () => void;
  onCreateTicket: () => void;
  onDraftChange: (next: SupportDraftState) => void;
  onOpenNewTicket: () => void;
  onSelectTicket: (ticketId: string | null) => void;
  onSubmit: () => void;
}

const fieldClassName =
  'border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus-visible:border-[var(--signal)] focus-visible:ring-2 focus-visible:ring-[var(--signal-glow)] focus-visible:ring-offset-0';

export default function SupportConversationPanel({
  canClientSend,
  canReply,
  clientRemainingMessages,
  conversations,
  createTicketOpen,
  draft,
  focusNonce,
  messages,
  open,
  responseText,
  scope,
  selectedConversation,
  ticket,
  tickets,
  onChange,
  onClose,
  onCreateTicket,
  onDraftChange,
  onOpenNewTicket,
  onSelectTicket,
  onSubmit,
}: SupportConversationPanelProps) {
  if (!open) {
    return null;
  }

  const isAdmin = scope === 'admin';

  return (
    <aside
      className="fixed inset-x-2 bottom-2 z-40 h-[min(82vh,720px)] overflow-hidden rounded-[28px] border border-[var(--border-strong)] bg-[var(--bg-base)] shadow-[var(--shadow-modal)] md:inset-x-auto md:bottom-6 md:right-6 md:w-[380px] lg:w-[396px]"
      role="dialog"
      aria-label={isAdmin ? 'Chat de soporte admin' : 'Chat de soporte'}
    >
      <div className="flex h-full min-h-0 flex-col bg-[color-mix(in_srgb,var(--bg-base)_92%,black)]">
        {createTicketOpen && !isAdmin ? (
          <SupportConversationComposerView
            draft={draft}
            fieldClassName={fieldClassName}
            onBack={() => onSelectTicket(null)}
            onCreateTicket={onCreateTicket}
            onDraftChange={onDraftChange}
          />
        ) : ticket ? (
          <SupportConversationThreadView
            canClientSend={canClientSend}
            canReply={canReply}
            clientRemainingMessages={clientRemainingMessages}
            fieldClassName={fieldClassName}
            focusNonce={focusNonce}
            isAdmin={isAdmin}
            messages={messages}
            responseText={responseText}
            selectedConversation={selectedConversation}
            ticket={ticket}
            onBack={() => onSelectTicket(null)}
            onChange={onChange}
            onClose={onClose}
            onSubmit={onSubmit}
          />
        ) : (
          <SupportConversationListView
            conversations={conversations}
            isAdmin={isAdmin}
            selectedTicketId={null}
            tickets={tickets}
            onClose={onClose}
            onOpenNewTicket={onOpenNewTicket}
            onSelectTicket={onSelectTicket}
          />
        )}
      </div>
    </aside>
  );
}
