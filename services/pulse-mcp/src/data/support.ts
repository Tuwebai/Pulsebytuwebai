import { supabase } from './client.js';
import type { TicketMessageRow, TicketRow } from './types.js';

export async function fetchSupportTickets(userId: string, limit: number) {
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('id, asunto, estado, prioridad, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  const ticketIds = ((tickets ?? []) as TicketRow[]).map((ticket) => ticket.id);
  let messages: TicketMessageRow[] = [];

  if (ticketIds.length > 0) {
    const { data: messageRows, error: messagesError } = await supabase
      .from('ticket_messages')
      .select('ticket_id, content, sender_role, created_at')
      .in('ticket_id', ticketIds)
      .order('created_at', { ascending: false });

    if (messagesError) throw messagesError;
    messages = (messageRows ?? []) as TicketMessageRow[];
  }

  return {
    userId,
    tickets: ((tickets ?? []) as TicketRow[]).map((ticket) => ({
      ...ticket,
      lastMessage: messages.find((message) => message.ticket_id === ticket.id) ?? null,
    })),
  };
}
