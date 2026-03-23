export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'responded' | 'closed' | 'in_conversation';
  priority: 'low' | 'medium' | 'high';
  user_id: string;
  assigned_to?: string;
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
  priority: 'low' | 'medium' | 'high';
}
