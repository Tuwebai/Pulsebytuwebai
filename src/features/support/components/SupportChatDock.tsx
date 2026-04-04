import type { SupportChatScope } from '@/features/support/supportChat.events';
import { useSupportChatDock } from '@/features/support/hooks/useSupportChatDock';
import SupportConversationPanel from './SupportConversationPanel';
import SupportFloatingLauncher from './SupportFloatingLauncher';

interface SupportChatDockProps {
  scope: SupportChatScope;
}

export default function SupportChatDock({ scope }: SupportChatDockProps) {
  const chat = useSupportChatDock(scope);

  return (
    <div data-surface={scope === 'admin' ? 'admin' : 'client'}>
      <SupportFloatingLauncher pendingCount={chat.pendingCount} scope={scope} onClick={chat.openConversation} />
      <SupportConversationPanel
        canClientSend={chat.canClientSend}
        canReply={chat.canReply}
        clientRemainingMessages={chat.clientRemainingMessages}
        conversations={chat.conversationSummaries}
        createTicketOpen={chat.createTicketOpen}
        draft={chat.draft}
        focusNonce={chat.focusNonce}
        isSubmittingReply={chat.isSubmittingReply}
        messages={chat.selectedMessages}
        open={chat.open}
        responseText={chat.responseText}
        scope={scope}
        selectedConversation={chat.selectedConversation}
        ticket={chat.selectedTicket}
        tickets={chat.tickets}
        onChange={chat.setResponseText}
        onClose={chat.closeConversation}
        onCreateTicket={() => {
          void chat.createTicket();
        }}
        onDraftChange={chat.setDraft}
        onOpenNewTicket={chat.openNewTicketComposer}
        onSelectTicket={chat.setSelectedTicketId}
        onSubmit={() => {
          void chat.submitReply();
        }}
      />
    </div>
  );
}
