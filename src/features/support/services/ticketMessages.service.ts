import {
  getTicketMessagesByTicketIds,
  countUnreadTicketMessagesForClient,
  createTicketMessage,
  getTicketMessagesByTicketId,
  markTicketMessagesAsRead,
} from '@/api/support/ticketMessages.api';
import type { User } from '@/contexts/appContext.types';
import type { SupportAdminTicketRecord } from '@/features/support/services/ticket.service';
import type {
  MarkTicketMessagesReadPayload,
  SendTicketMessagePayload,
  SupportConversationSummary,
  TicketMessage,
  TicketMessageSenderRole,
} from '@/features/support/ticketMessages.types';

function resolveTicketMessageSenderRole(user: Pick<User, 'role'>): TicketMessageSenderRole {
  return user.role === 'admin' ? 'admin' : 'client';
}

export const ticketMessagesService = {
  async getByTicketId(ticketId: string): Promise<TicketMessage[]> {
    return getTicketMessagesByTicketId(ticketId);
  },

  async getByTicketIds(ticketIds: string[]): Promise<TicketMessage[]> {
    return getTicketMessagesByTicketIds(ticketIds);
  },

  async send({
    content,
    ticketId,
    user,
  }: {
    content: string;
    ticketId: string;
    user: Pick<User, 'id' | 'role'>;
  }): Promise<TicketMessage> {
    const payload: SendTicketMessagePayload = {
      content: content.trim(),
      senderId: user.id,
      senderRole: resolveTicketMessageSenderRole(user),
      ticketId,
    };

    return createTicketMessage(payload);
  },

  async markAsRead({
    ticketId,
    viewerRole,
  }: {
    ticketId: string;
    viewerRole: TicketMessageSenderRole;
  }): Promise<void> {
    const payload: MarkTicketMessagesReadPayload = {
      senderRole: viewerRole === 'admin' ? 'client' : 'admin',
      ticketId,
    };

    await markTicketMessagesAsRead(payload);
  },

  async countUnreadForClient(userId: string): Promise<number> {
    return countUnreadTicketMessagesForClient(userId);
  },
};

export function buildSupportConversationSummary({
  ticket,
  messages,
  viewerRole,
}: {
  ticket: SupportAdminTicketRecord;
  messages: TicketMessage[];
  viewerRole: TicketMessageSenderRole;
}): SupportConversationSummary {
  const sortedMessages = [...messages].sort((left, right) => left.created_at.localeCompare(right.created_at));
  const lastMessage = sortedMessages[sortedMessages.length - 1] ?? null;
  const counterpartRole: TicketMessageSenderRole = viewerRole === 'admin' ? 'client' : 'admin';

  return {
    assignedAdminName: null,
    lastMessage: lastMessage?.content ?? ticket.description,
    lastMessageAt:
      lastMessage?.created_at ??
      ticket.fecha_respuesta_cliente ??
      ticket.fecha_respuesta ??
      ticket.created_at ??
      null,
    messages: sortedMessages,
    participantAvatarUrl: null,
    participantEmail: null,
    participantName: 'Equipo Pulse',
    ticketId: ticket.id,
    title: ticket.title,
    unreadCount: sortedMessages.filter((message) => message.sender_role === counterpartRole && !message.is_read).length,
  };
}
