export interface Project {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  phase?: string;
  budget?: number;
  deadline?: string;
  team_members?: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: string;
  assigned_by: string;
  project_id: string;
  phase_key?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  attachments?: string[];
}

export interface UserPresence {
  id: string;
  user_id: string;
  user_name: string;
  status: 'online' | 'away' | 'offline';
  last_seen: string;
  current_project?: string;
  current_page?: string;
}

export interface SecurityLog {
  id: string;
  action: string;
  user: string;
  user_email: string;
  ip_address: string;
  user_agent: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'auth' | 'data' | 'system' | 'payment' | 'admin';
  details: unknown;
  location?: string;
  success: boolean;
}
