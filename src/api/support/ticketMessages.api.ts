import { supabase } from '@/data/supabase/client';
import type {
  MarkTicketMessagesReadPayload,
  SendTicketMessagePayload,
  TicketMessage,
  TicketMessageSender,
  TicketMessageSenderRole,
} from '@/features/support/ticketMessages.types';

interface TicketMessageRow {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_role: TicketMessageSenderRole;
  sender_avatar_url?: string | null;
  sender_email?: string | null;
  sender_full_name?: string | null;
  content: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  sender?: TicketMessageSender | TicketMessageSender[] | null;
}

const TICKET_MESSAGE_SELECT = [
  'id',
  'ticket_id',
  'sender_id',
  'sender_role',
  'sender_full_name',
  'sender_email',
  'sender_avatar_url',
  'content',
  'is_read',
  'read_at',
  'created_at',
  'sender:users!ticket_messages_sender_id_fkey(id,email,full_name,avatar_url)',
].join(', ');

function mapTicketMessageRow(row: TicketMessageRow): TicketMessage {
  const relatedSender = Array.isArray(row.sender) ? row.sender[0] ?? null : row.sender ?? null;
  const sender =
    relatedSender ??
    (row.sender_email
      ? {
          avatar_url: row.sender_avatar_url ?? null,
          email: row.sender_email,
          full_name: row.sender_full_name ?? null,
          id: row.sender_id,
        }
      : null);

  return {
    content: row.content,
    created_at: row.created_at,
    id: row.id,
    is_read: row.is_read,
    read_at: row.read_at,
    sender,
    sender_id: row.sender_id,
    sender_role: row.sender_role,
    ticket_id: row.ticket_id,
  };
}

export async function getTicketMessagesByTicketId(ticketId: string): Promise<TicketMessage[]> {
  const { data, error } = await supabase
    .from('ticket_messages')
    .select(TICKET_MESSAGE_SELECT)
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as TicketMessageRow[]).map(mapTicketMessageRow);
}

export async function getTicketMessagesByTicketIds(ticketIds: string[]): Promise<TicketMessage[]> {
  if (ticketIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('ticket_messages')
    .select(TICKET_MESSAGE_SELECT)
    .in('ticket_id', ticketIds)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as TicketMessageRow[]).map(mapTicketMessageRow);
}

export async function createTicketMessage(payload: SendTicketMessagePayload): Promise<TicketMessage> {
  const { data, error } = await supabase
    .from('ticket_messages')
    .insert({
      content: payload.content,
      sender_id: payload.senderId,
      sender_role: payload.senderRole,
      ticket_id: payload.ticketId,
    })
    .select(TICKET_MESSAGE_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return mapTicketMessageRow(data as unknown as TicketMessageRow);
}

export async function markTicketMessagesAsRead(payload: MarkTicketMessagesReadPayload): Promise<void> {
  const { error } = await supabase
    .from('ticket_messages')
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq('ticket_id', payload.ticketId)
    .eq('sender_role', payload.senderRole)
    .eq('is_read', false);

  if (error) {
    throw error;
  }
}

export async function countUnreadTicketMessagesForClient(userId: string): Promise<number> {
  const { data: tickets, error: ticketsError } = await supabase
    .from('tickets')
    .select('id')
    .eq('user_id', userId);

  if (ticketsError) {
    throw ticketsError;
  }

  const ticketIds = (tickets ?? []).map((ticket) => ticket.id).filter((ticketId): ticketId is string => typeof ticketId === 'string');

  if (ticketIds.length === 0) {
    return 0;
  }

  const { count, error } = await supabase
    .from('ticket_messages')
    .select('id', { count: 'exact', head: true })
    .in('ticket_id', ticketIds)
    .eq('sender_role', 'admin')
    .eq('is_read', false);

  if (error) {
    throw error;
  }

  return count ?? 0;
}
