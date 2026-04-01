import type { AdminTicket, TicketFilters, TicketFormData, TicketPriority, TicketStats, TicketStatus } from '@/features/admin/tickets/types/adminTicket.types';

export const INITIAL_TICKET_FORM: TicketFormData = {
  title: '',
  description: '',
  priority: 'medium',
  status: 'open',
  category: '',
  assignedTo: '',
};

export const INITIAL_TICKET_FILTERS: TicketFilters = {
  searchTerm: '',
  status: 'all',
  priority: 'all',
  sortOrder: 'desc',
};

export const INITIAL_TICKET_STATS: TicketStats = {
  total: 0,
  open: 0,
  inProgress: 0,
  resolved: 0,
  closed: 0,
  highPriority: 0,
  urgentPriority: 0,
};

export function getTicketTitle(ticket: AdminTicket) {
  return ticket.asunto || ticket.title || 'Sin título';
}

export function getTicketDescription(ticket: AdminTicket) {
  return ticket.mensaje || ticket.description || '';
}

export function getTicketContact(ticket: AdminTicket) {
  return ticket.email || ticket.assigned_to || 'Sin asignar';
}

export function getTicketDate(ticket: AdminTicket) {
  const rawDate = ticket.fecha || ticket.created_at;
  return rawDate ? new Date(rawDate).toLocaleDateString() : 'Sin fecha';
}

export function getTicketStatusValue(ticket: AdminTicket): string {
  return normalizeTicketStatus(ticket.status || ticket.estado || 'open');
}

export function normalizeTicketStatus(status: string): string {
  switch (status) {
    case 'abierto':
      return 'open';
    case 'en_progreso':
    case 'respondido':
      return 'in_progress';
    case 'resuelto':
      return 'resolved';
    case 'cerrado':
      return 'closed';
    default:
      return status;
  }
}

export function getFormPriority(ticket: AdminTicket): TicketPriority {
  return ['low', 'medium', 'high', 'urgent'].includes(ticket.priority || '')
    ? (ticket.priority as TicketPriority)
    : 'medium';
}

export function getFormStatus(ticket: AdminTicket): TicketStatus {
  const normalizedStatus = normalizeTicketStatus(getTicketStatusValue(ticket));
  return ['open', 'in_progress', 'resolved', 'closed'].includes(normalizedStatus)
    ? (normalizedStatus as TicketStatus)
    : 'open';
}

export function buildFormDataFromTicket(ticket: AdminTicket): TicketFormData {
  return {
    title: ticket.title || ticket.asunto || '',
    description: ticket.description || ticket.mensaje || '',
    priority: getFormPriority(ticket),
    status: getFormStatus(ticket),
    category: ticket.category || '',
    assignedTo: ticket.assigned_to || '',
  };
}

export function calculateTicketStats(tickets: AdminTicket[]): TicketStats {
  return {
    total: tickets.length,
    open: tickets.filter((ticket) => normalizeTicketStatus(getTicketStatusValue(ticket)) === 'open').length,
    inProgress: tickets.filter((ticket) => normalizeTicketStatus(getTicketStatusValue(ticket)) === 'in_progress').length,
    resolved: tickets.filter((ticket) => normalizeTicketStatus(getTicketStatusValue(ticket)) === 'resolved').length,
    closed: tickets.filter((ticket) => normalizeTicketStatus(getTicketStatusValue(ticket)) === 'closed').length,
    highPriority: tickets.filter((ticket) => ticket.priority === 'high').length,
    urgentPriority: tickets.filter((ticket) => ticket.priority === 'urgent').length,
  };
}

export function filterAndSortTickets(tickets: AdminTicket[], filters: TicketFilters) {
  const searchTerm = filters.searchTerm.trim().toLowerCase();

  return [...tickets]
    .filter((ticket) => {
      const matchesSearch =
        !searchTerm ||
        getTicketTitle(ticket).toLowerCase().includes(searchTerm) ||
        getTicketDescription(ticket).toLowerCase().includes(searchTerm) ||
        getTicketContact(ticket).toLowerCase().includes(searchTerm);

      const matchesStatus =
        filters.status === 'all' || normalizeTicketStatus(getTicketStatusValue(ticket)) === filters.status;
      const matchesPriority =
        filters.priority === 'all' || ticket.priority === filters.priority;

      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((ticketA, ticketB) => {
      const dateA = new Date(ticketA.fecha || ticketA.created_at || 0).getTime();
      const dateB = new Date(ticketB.fecha || ticketB.created_at || 0).getTime();
      return filters.sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
}

export function getStatusLabel(status: string) {
  switch (status) {
    case 'open':
    case 'abierto':
      return 'Abierto';
    case 'in_progress':
    case 'en_progreso':
    case 'in_conversation':
    case 'respondido':
      return 'En progreso';
    case 'resolved':
    case 'resuelto':
      return 'Resuelto';
    case 'closed':
    case 'cerrado':
      return 'Cerrado';
    default:
      return 'Pendiente';
  }
}

export function getStatusTone(status: string) {
  switch (normalizeTicketStatus(status)) {
    case 'open':
      return 'border-sky-500/20 bg-sky-500/10 text-sky-200';
    case 'in_progress':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-200';
    case 'resolved':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200';
    case 'closed':
      return 'border-slate-500/20 bg-slate-500/10 text-slate-200';
    default:
      return 'border-violet-500/20 bg-violet-500/10 text-violet-200';
  }
}

export function getPriorityLabel(priority?: string | null) {
  switch (priority) {
    case 'low':
      return 'Baja';
    case 'high':
      return 'Alta';
    case 'urgent':
      return 'Urgente';
    default:
      return 'Media';
  }
}

export function getPriorityTone(priority?: string | null) {
  switch (priority) {
    case 'low':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200';
    case 'high':
      return 'border-orange-500/20 bg-orange-500/10 text-orange-200';
    case 'urgent':
      return 'border-rose-500/20 bg-rose-500/10 text-rose-200';
    default:
      return 'border-sky-500/20 bg-sky-500/10 text-sky-200';
  }
}
