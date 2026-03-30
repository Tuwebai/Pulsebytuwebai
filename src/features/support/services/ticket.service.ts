import { supabase } from '@/lib/supabase/supabase';

export interface SupportAdminTicketRecord {
  id: string;
  asunto?: string;
  mensaje?: string;
  email?: string;
  fecha?: string;
  respuesta?: string;
  respondido_por?: string;
  fecha_respuesta?: string;
  estado?: string;
  respuesta_cliente?: string;
  fecha_respuesta_cliente?: string;
  title?: string;
  description?: string | null;
  status?: string;
  priority?: string;
  user_id?: string;
  assigned_to?: string | null;
  created_at?: string;
  updated_at?: string;
  project_id?: string;
  category?: string;
}

export const ticketService = {
  async getTickets(): Promise<SupportAdminTicketRecord[]> {
    const { data, error } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createTicket(ticket: Omit<SupportAdminTicketRecord, 'id' | 'created_at' | 'updated_at'>): Promise<SupportAdminTicketRecord> {
    const { data, error } = await supabase.from('tickets').insert([ticket]).select().single();
    if (error) throw error;
    return data;
  },

  async updateTicket(id: string, updates: Partial<SupportAdminTicketRecord>): Promise<void> {
    const { error } = await supabase.from('tickets').update(updates).eq('id', id);
    if (error) throw error;
  },

  async deleteTicket(id: string): Promise<void> {
    const { error } = await supabase.from('tickets').delete().eq('id', id);
    if (error) throw error;
  },

  async getTicketsByClient(clientId: string): Promise<SupportAdminTicketRecord[]> {
    const { data, error } = await supabase.from('tickets').select('*').eq('user_id', clientId).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getTicketsByAssignee(userId: string): Promise<SupportAdminTicketRecord[]> {
    const { data, error } = await supabase.from('tickets').select('*').eq('assigned_to', userId).order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },
};
