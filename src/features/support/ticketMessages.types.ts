export type TicketMessageSenderRole = 'client' | 'admin';

export interface TicketMessageSender {
  id: string;
  avatar_url?: string | null;
  email: string;
  full_name: string | null;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_role: TicketMessageSenderRole;
  content: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  sender: TicketMessageSender | null;
}

export interface SupportConversationSummary {
  assignedAdminName: string | null;
  lastMessage: string;
  lastMessageAt: string | null;
  messages: TicketMessage[];
  participantAvatarUrl: string | null;
  participantEmail: string | null;
  participantName: string;
  ticketId: string;
  title: string;
  unreadCount: number;
}

export interface SendTicketMessagePayload {
  content: string;
  senderId: string;
  senderRole: TicketMessageSenderRole;
  ticketId: string;
}

export interface MarkTicketMessagesReadPayload {
  senderRole: TicketMessageSenderRole;
  ticketId: string;
}
