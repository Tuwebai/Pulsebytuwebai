// Tipos de Ticket para el Dashboard TuWebAI
// Centralizados desde: lib/services/ticketService.ts

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  stage: string;
  assigned_to?: string;
  client_id: string;
  client_email: string;
  category?: string;
  tags: string[];
  escalation_count: number;
  created_at: string;
  updated_at: string;
  last_activity: string;
}

export interface CreateTicketData {
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  client_email: string;
  tags?: string[];
}

export interface UpdateTicketData {
  subject?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'new' | 'in_progress' | 'resolved' | 'closed';
  stage?: string;
  assigned_to?: string;
  category?: string;
  tags?: string[];
}

export interface TicketFilters {
  status?: string;
  priority?: string;
  category?: string;
  assigned_to?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface TicketStats {
  total: number;
  new: number;
  in_progress: number;
  resolved: number;
  closed: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export default Ticket;
