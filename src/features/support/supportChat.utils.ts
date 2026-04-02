import type { SupportAdminTicketRecord } from '@/features/support/services/ticket.service';
import type { SupportChatScope } from '@/features/support/supportChat.events';

type TicketRecord = SupportAdminTicketRecord;

function isClosedTicket(ticket: TicketRecord) {
  return ticket.status === 'closed' || ticket.status === 'resolved';
}

function hasCustomerReplyPending(ticket: TicketRecord) {
  if (!ticket.respuesta_cliente) {
    return false;
  }

  if (!ticket.fecha_respuesta) {
    return true;
  }

  return !ticket.fecha_respuesta_cliente || ticket.fecha_respuesta_cliente > ticket.fecha_respuesta;
}

function hasAdminReplyPending(ticket: TicketRecord) {
  if (!ticket.respuesta) {
    return false;
  }

  if (!ticket.fecha_respuesta_cliente) {
    return true;
  }

  return (ticket.fecha_respuesta ?? '') > (ticket.fecha_respuesta_cliente ?? '');
}

export function resolveSupportPendingCount(
  tickets: TicketRecord[],
  scope: SupportChatScope,
  currentAdminId?: string | null,
) {
  return tickets.filter((ticket) => {
    if (isClosedTicket(ticket)) {
      return false;
    }

    if (scope === 'client') {
      return hasAdminReplyPending(ticket);
    }

    if (ticket.assigned_admin_id && ticket.assigned_admin_id !== currentAdminId) {
      return false;
    }

    return !ticket.assigned_admin_id || hasCustomerReplyPending(ticket);
  }).length;
}

export function resolveDefaultSupportTicket(
  tickets: TicketRecord[],
  scope: SupportChatScope,
  currentAdminId?: string | null,
) {
  if (tickets.length === 0) {
    return null;
  }

  if (scope === 'client') {
    return (
      tickets.find((ticket) => !isClosedTicket(ticket) && hasAdminReplyPending(ticket)) ??
      tickets.find((ticket) => !isClosedTicket(ticket)) ??
      tickets[0]
    );
  }

  return (
    tickets.find((ticket) => ticket.assigned_admin_id === currentAdminId && hasCustomerReplyPending(ticket)) ??
    tickets.find((ticket) => !ticket.assigned_admin_id) ??
    tickets.find((ticket) => ticket.assigned_admin_id === currentAdminId) ??
    tickets[0]
  );
}

export function canReplyToSupportTicket(
  ticket: TicketRecord | null,
  scope: SupportChatScope,
  currentAdminId?: string | null,
) {
  if (!ticket) {
    return false;
  }

  if (scope === 'client') {
    return true;
  }

  return !ticket.assigned_admin_id || ticket.assigned_admin_id === currentAdminId;
}
