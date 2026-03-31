import type { SupportAdminTicketRecord } from '@/features/support/services/ticket.service';

export interface TicketFormData {
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  category: string;
  assignedTo: string;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  highPriority: number;
  urgentPriority: number;
}

export interface TicketFilters {
  searchTerm: string;
  status: string;
  priority: string;
  sortOrder: 'asc' | 'desc';
}

export interface AdminTicketsScreenProps {
  tickets?: SupportAdminTicketRecord[];
  refreshData?: () => void;
  lastUpdate?: Date;
}

export type AdminTicket = SupportAdminTicketRecord;
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
