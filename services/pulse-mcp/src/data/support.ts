import { supabase } from './client.js';
import { looksLikeUuid, normalizeIdentifier } from './identifiers.js';
import type { TicketMessageRow, TicketRow } from './types.js';

const TICKET_SELECT = 'id, asunto, mensaje, email, estado, prioridad, status, priority, user_id, assigned_admin_id, created_at, updated_at';

export function getCanonicalTicketState(ticket: Pick<TicketRow, 'estado' | 'status'>): 'open' | 'in_conversation' | 'closed' | null {
  if (ticket.status === 'closed' || ticket.estado === 'cerrado') {
    return 'closed';
  }

  if (ticket.status === 'in_conversation' || ticket.estado === 'respondido') {
    return 'in_conversation';
  }

  if (ticket.status === 'open' || ticket.estado === 'abierto') {
    return 'open';
  }

  return null;
}

export function getCanonicalTicketPriority(ticket: Pick<TicketRow, 'prioridad' | 'priority'>): 'low' | 'medium' | 'high' | null {
  if (ticket.priority === 'low' || ticket.prioridad === 'baja') {
    return 'low';
  }

  if (ticket.priority === 'high' || ticket.prioridad === 'alta') {
    return 'high';
  }

  if (ticket.priority === 'medium' || ticket.prioridad === 'media') {
    return 'medium';
  }

  return null;
}

export function withCanonicalTicketFields(ticket: TicketRow): TicketRow {
  return {
    ...ticket,
    canonical_state: getCanonicalTicketState(ticket),
    canonical_priority: getCanonicalTicketPriority(ticket),
  };
}

export function buildTicketStatePatch(state: 'open' | 'in_conversation' | 'closed') {
  if (state === 'closed') {
    return { estado: 'cerrado', status: 'closed' };
  }

  if (state === 'in_conversation') {
    return { estado: 'respondido', status: 'in_conversation' };
  }

  return { estado: 'abierto', status: 'open' };
}

export async function resolveTicketIdentifier(ticketIdentifier: string) {
  const identifier = normalizeIdentifier(ticketIdentifier);

  if (!identifier) {
    throw new Error('Necesitamos un identificador de ticket valido.');
  }

  if (!looksLikeUuid(identifier)) {
    throw new Error('El identificador real del ticket en Pulse debe ser un UUID valido.');
  }

  const { data, error } = await supabase
    .from('tickets')
    .select(TICKET_SELECT)
    .eq('id', identifier)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error(`No encontramos un ticket en Pulse para "${identifier}".`);
  }

  return withCanonicalTicketFields(data as TicketRow);
}

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
      ...withCanonicalTicketFields(ticket),
      lastMessage: messages.find((message) => message.ticket_id === ticket.id) ?? null,
    })),
  };
}

export async function fetchTicketDetail(ticketId: string) {
  const ticket = await resolveTicketIdentifier(ticketId);
  const [messagesResult, clientResult, assigneeResult] = await Promise.all([
    supabase
      .from('ticket_messages')
      .select('id, ticket_id, sender_id, sender_role, content, is_read, read_at, created_at')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true }),
    ticket.user_id
      ? supabase.from('users').select('id, email, full_name, phone, role').eq('id', ticket.user_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    ticket.assigned_admin_id
      ? supabase.from('users').select('id, email, full_name, role').eq('id', ticket.assigned_admin_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (messagesResult.error) throw messagesResult.error;
  if (clientResult.error) throw clientResult.error;
  if (assigneeResult.error) throw assigneeResult.error;

  return {
    ticket,
    client: clientResult.data
      ? {
          id: clientResult.data.id,
          email: clientResult.data.email,
          full_name: clientResult.data.full_name,
          phone: clientResult.data.phone ?? null,
          role: clientResult.data.role ?? null,
        }
      : null,
    assignee: assigneeResult.data
      ? {
          id: assigneeResult.data.id,
          email: assigneeResult.data.email,
          full_name: assigneeResult.data.full_name,
          role: assigneeResult.data.role ?? null,
        }
      : null,
    messages: ((messagesResult.data ?? []) as Array<TicketMessageRow & { is_read?: boolean | null; read_at?: string | null }>).map((message) => ({
      id: message.id ?? null,
      ticket_id: message.ticket_id,
      sender_id: message.sender_id ?? null,
      sender_role: message.sender_role,
      content: message.content,
      is_read: message.is_read ?? null,
      read_at: message.read_at ?? null,
      created_at: message.created_at,
    })),
  };
}
