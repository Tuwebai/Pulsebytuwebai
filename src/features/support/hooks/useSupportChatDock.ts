import { useCallback, useMemo, useState } from 'react';
import { useSessionStorageState } from '@/core/hooks/useSessionStorageState';
import { toast } from '@/hooks/use-toast';
import { useApp } from '@/contexts/AppContext';
import type { SupportDraftState } from '@/features/support';
import { buildSupportConversationSummary } from '@/features/support/services/ticketMessages.service';
import { type SupportConversationSummary } from '@/features/support/ticketMessages.types';
import {
  MAX_CLIENT_CONSECUTIVE_MESSAGES,
  canClientSendMessage,
  getClientConsecutiveMessages,
} from '@/features/support/hooks/useSupportChatDock.business';
import {
  useSupportChatDockData,
  useSupportChatDockIntents,
  useSupportChatReadState,
} from '@/features/support/hooks/useSupportChatDock.effects';
import { useSupportChatMessagesRealtime } from '@/features/support/hooks/useSupportChatMessagesRealtime';
import { createSupportChatTicket, submitSupportChatReply } from '@/features/support/hooks/useSupportChatDock.actions';
import { buildConversationIdentity } from '@/features/support/hooks/supportChatIdentity.utils';
import { type SupportChatScope } from '@/features/support/supportChat.events';
import {
  canReplyToSupportTicket,
  resolveSupportPendingCount,
} from '@/features/support/supportChat.utils';
import type { TicketMessage } from '@/features/support/ticketMessages.types';

const SUPPORT_DRAFT_INITIAL_STATE: SupportDraftState = {
  title: '',
  description: '',
  priority: 'medium',
};

function buildOptimisticTicketMessage({
  content,
  scope,
  ticketId,
  user,
}: {
  content: string;
  scope: SupportChatScope;
  ticketId: string;
  user: NonNullable<ReturnType<typeof useApp>['user']>;
}): TicketMessage {
  return {
    content,
    created_at: new Date().toISOString(),
    id: `optimistic:${ticketId}:${Date.now()}`,
    is_read: true,
    read_at: null,
    sender: {
      avatar_url: user.avatar_url ?? null,
      email: user.email,
      full_name: user.full_name ?? null,
      id: user.id,
    },
    sender_id: user.id,
    sender_role: scope === 'admin' ? 'admin' : 'client',
    ticket_id: ticketId,
  };
}

export function useSupportChatDock(scope: SupportChatScope) {
  const { user } = useApp();
  const [responseText, setResponseText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [createTicketOpen, setCreateTicketOpen] = useState(false);
  const [focusNonce, setFocusNonce] = useState(0);
  const [draft, setDraft] = useSessionStorageState<SupportDraftState>(
    `pulse:support-chat:${scope}:${user?.id ?? 'anon'}:draft`,
    SUPPORT_DRAFT_INITIAL_STATE,
  );
  const [open, setOpen] = useSessionStorageState(`pulse:support-chat:${scope}:${user?.id ?? 'anon'}:open`, false);
  const [selectedTicketId, setSelectedTicketId] = useSessionStorageState<string | null>(
    `pulse:support-chat:${scope}:${user?.id ?? 'anon'}:ticket`,
    null,
  );
  const { loading, loadTickets, messagesByTicketId, setMessagesByTicketId, tickets, userMap } = useSupportChatDockData(scope, user?.id);

  const selectedTicket = useMemo(
    () => {
      if (!selectedTicketId) {
        return null;
      }

      return tickets.find((ticket) => ticket.id === selectedTicketId) ?? null;
    },
    [selectedTicketId, tickets],
  );
  const selectedMessages = useMemo(
    () => (selectedTicket ? messagesByTicketId[selectedTicket.id] ?? [] : []),
    [messagesByTicketId, selectedTicket],
  );
  const conversationSummaries = useMemo<SupportConversationSummary[]>(
    () =>
      tickets
        .map((ticket) => {
          const summary = buildSupportConversationSummary({
            ticket,
            messages: messagesByTicketId[ticket.id] ?? [],
            viewerRole: scope === 'admin' ? 'admin' : 'client',
          });

          return buildConversationIdentity({
            scope,
            summary,
            ticket,
            userMap,
          });
        })
        .sort((left, right) => new Date(right.lastMessageAt ?? 0).getTime() - new Date(left.lastMessageAt ?? 0).getTime()),
    [messagesByTicketId, scope, tickets, userMap],
  );
  const selectedConversation = useMemo(
    () => conversationSummaries.find((conversation) => conversation.ticketId === selectedTicket?.id) ?? null,
    [conversationSummaries, selectedTicket?.id],
  );
  const selectTicket = useCallback(
    (ticketId: string | null) => {
      setCreateTicketOpen(false);
      setSelectedTicketId(ticketId);
    },
    [setSelectedTicketId],
  );
  const canReply = canReplyToSupportTicket(selectedTicket, scope, user?.id);
  const canClientSend = useMemo(() => (scope === 'client' ? canClientSendMessage(selectedMessages) : true), [scope, selectedMessages]);
  const clientRemainingMessages = useMemo(
    () => Math.max(MAX_CLIENT_CONSECUTIVE_MESSAGES - getClientConsecutiveMessages(selectedMessages), 0),
    [selectedMessages],
  );
  const pendingCount = useMemo(() => {
    if (scope === 'client') {
      return conversationSummaries.reduce((total, conversation) => total + conversation.unreadCount, 0);
    }

    return resolveSupportPendingCount(tickets, scope, user?.id);
  }, [conversationSummaries, scope, tickets, user?.id]);

  useSupportChatReadState({
    open,
    scope,
    selectedMessages,
    selectedTicket,
    setMessagesByTicketId,
    userId: user?.id,
  });
  useSupportChatMessagesRealtime({
    ticketIds: tickets.map((ticket) => ticket.id),
    userId: user?.id,
    setMessagesByTicketId,
  });
  useSupportChatDockIntents({
    scope,
    selectTicket,
    setFocusNonce,
    setOpen,
  });

  const openConversation = useCallback(() => {
    selectTicket(null);
    setCreateTicketOpen(false);
    setOpen(true);
  }, [selectTicket, setOpen]);

  const closeConversation = useCallback(() => {
    setOpen(false);
    setCreateTicketOpen(false);
    setResponseText('');
  }, [setOpen]);

  const openNewTicketComposer = useCallback(() => {
    selectTicket(null);
    setCreateTicketOpen(true);
    setOpen(true);
  }, [selectTicket, setOpen]);

  const submitReply = useCallback(async () => {
    if (isSubmittingReply) {
      return;
    }

    const currentTicketId = selectedTicket?.id ?? null;
    const trimmedResponse = responseText.trim();

    if (!currentTicketId || !trimmedResponse || !user?.id) {
      return;
    }

    setIsSubmittingReply(true);
    setResponseText('');
    const optimisticMessage = buildOptimisticTicketMessage({
      content: trimmedResponse,
      scope,
      ticketId: currentTicketId,
      user,
    });
    setMessagesByTicketId((current) => ({
      ...current,
      [currentTicketId]: [...(current[currentTicketId] ?? []), optimisticMessage],
    }));

    try {
      const result = await submitSupportChatReply({
        canClientSend,
        canReply,
        loadTickets,
        responseText: trimmedResponse,
        scope,
        selectedTicket,
        user,
      });

      if (!result) {
        setMessagesByTicketId((current) => ({
          ...current,
          [currentTicketId]: (current[currentTicketId] ?? []).filter((message) => message.id !== optimisticMessage.id),
        }));
        setResponseText(trimmedResponse);
        return;
      }

      setMessagesByTicketId((current) => ({
        ...current,
        [result.ticketId]: (current[result.ticketId] ?? []).map((message) =>
          message.id === optimisticMessage.id ? result.message : message,
        ),
      }));
      setOpen(true);
    } catch (error) {
      setMessagesByTicketId((current) => ({
        ...current,
        [currentTicketId]: (current[currentTicketId] ?? []).filter((message) => message.id !== optimisticMessage.id),
      }));
      setResponseText(trimmedResponse);
      console.error('Error respondiendo ticket desde burbuja:', error);
      toast({
        title: 'No pudimos enviar tu mensaje',
        description: 'Volve a intentar en unos segundos.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmittingReply(false);
    }
  }, [canClientSend, canReply, isSubmittingReply, loadTickets, responseText, scope, selectedTicket, setMessagesByTicketId, setOpen, user]);

  const createTicket = useCallback(async () => {
    try {
      const ticket = await createSupportChatTicket({
        draft,
        loadTickets,
        scope,
        user,
      });

      if (!ticket) {
        return;
      }

      setDraft(SUPPORT_DRAFT_INITIAL_STATE);
      selectTicket(ticket.id);
      setOpen(true);
    } catch (error) {
      console.error('Error creando ticket desde el chat:', error);
      toast({
        title: 'No pudimos abrir el ticket',
        description: 'Volve a intentar en unos segundos.',
        variant: 'destructive',
      });
    }
  }, [draft, loadTickets, scope, selectTicket, setDraft, setOpen, user]);

  return {
    canClientSend,
    canReply,
    clientRemainingMessages,
    closeConversation,
    conversationSummaries,
    createTicket,
    createTicketOpen,
    draft,
    focusNonce,
    loading,
    open,
    openConversation,
    openNewTicketComposer,
    pendingCount,
    responseText,
    selectedConversation,
    selectedMessages,
    selectedTicket,
    setDraft,
    setSelectedTicketId: selectTicket,
    setResponseText,
    isSubmittingReply,
    submitReply,
    tickets,
  };
}
