export interface ProjectRow {
  id: string;
  name: string | null;
  status: string | null;
  domain: string | null;
  ga4_property_id: string | null;
  completion_percentage: number | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at: string | null;
  created_by?: string | null;
}

export interface UserRow {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  role?: string | null;
  website?: string | null;
  onboarding_completed?: boolean | null;
  onboarding_completed_at?: string | null;
  pulse_access_status?: 'pending' | 'invited' | 'active' | 'disabled' | null;
  pulse_access_granted_at?: string | null;
  pulse_access_granted_by?: string | null;
  pulse_access_disabled_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PulseMetricRow {
  metric_date: string;
  visits: number | null;
  contacts: number | null;
  avg_session_sec: number | null;
  top_page: string | null;
  top_page_visits: number | null;
  top_pages: Array<{ label?: string | null; path?: string | null; visits?: number | null }> | null;
  updated_at: string | null;
}

export interface NotificationRow {
  id: string;
  title: string;
  message: string | null;
  category: string | null;
  type: string | null;
  is_read: boolean | null;
  is_urgent: boolean | null;
  created_at: string | null;
}

export interface TicketRow {
  id: string;
  asunto: string | null;
  mensaje?: string | null;
  email?: string | null;
  estado: string | null;
  prioridad: string | null;
  status?: string | null;
  priority?: string | null;
  canonical_state?: 'open' | 'in_conversation' | 'closed' | null;
  canonical_priority?: 'low' | 'medium' | 'high' | null;
  user_id?: string | null;
  assigned_admin_id?: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface TicketMessageRow {
  id?: string;
  ticket_id: string;
  content: string;
  sender_role: 'client' | 'admin';
  sender_id?: string;
  created_at: string;
}
