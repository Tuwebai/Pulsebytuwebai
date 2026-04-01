import { supabase } from '@/lib/supabase/supabase';
import {
  buildTicketInsertPayload,
  buildTicketUpdatePayload,
  mapTicketRow,
} from '@/features/support/services/ticket.service.utils';

export interface SupportAdminTicketRecord {
  id: string;
  asunto?: string;
  mensaje?: string;
  email?: string | null;
  fecha?: string | null;
  respuesta?: string | null;
  respondido_por?: string | null;
  fecha_respuesta?: string | null;
  estado?: string | null;
  prioridad?: string | null;
  respuesta_cliente?: string | null;
  fecha_respuesta_cliente?: string | null;
  title: string;
  description: string;
  status: string;
  priority: string;
  user_id?: string | null;
  assigned_to?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  project_id?: string | null;
  category?: string | null;
}

type TicketInsertInput = Omit<SupportAdminTicketRecord, 'id'>;
type TicketUpdateInput = Partial<Omit<SupportAdminTicketRecord, 'id'>>;
type TicketRow = Record<string, unknown>;

export const ticketService = {
  async getTickets(): Promise<SupportAdminTicketRecord[]> {
    const { data, error } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((row) => mapTicketRow(row as TicketRow));
  },

  async createTicket(ticket: TicketInsertInput): Promise<SupportAdminTicketRecord> {
    const payload = buildTicketInsertPayload(ticket);
    const { data, error } = await supabase.from('tickets').insert([payload]).select().single();
    if (error) throw error;
    return mapTicketRow(data as TicketRow);
  },

  async updateTicket(id: string, updates: TicketUpdateInput): Promise<void> {
    const payload = buildTicketUpdatePayload(updates);
    const { error } = await supabase.from('tickets').update(payload).eq('id', id);
    if (error) throw error;
  },

  async deleteTicket(id: string): Promise<void> {
    const { error } = await supabase.from('tickets').delete().eq('id', id);
    if (error) throw error;
  },

  async getTicketsByClient(clientId: string): Promise<SupportAdminTicketRecord[]> {
    const { data, error } = await supabase.from('tickets').select('*').eq('user_id', clientId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((row) => mapTicketRow(row as TicketRow));
  },

  async getTicketsByAssignee(userId: string): Promise<SupportAdminTicketRecord[]> {
    const { data, error } = await supabase.from('tickets').select('*').eq('assigned_to', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((row) => mapTicketRow(row as TicketRow));
  },
};
