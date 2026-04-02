export type SupportPriority = 'low' | 'medium' | 'high';
export type EmailPriority = 'baja' | 'media' | 'alta';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'responded' | 'resolved' | 'closed' | 'in_conversation';
  priority: SupportPriority;
  user_id: string;
  assigned_admin_id?: string | null;
  created_at: string;
  updated_at: string;
  respuesta?: string;
  respondido_por?: string;
  fecha_respuesta?: string;
  respuesta_cliente?: string;
  fecha_respuesta_cliente?: string;
}

export interface SupportDraftState {
  title: string;
  description: string;
  priority: SupportPriority;
}
