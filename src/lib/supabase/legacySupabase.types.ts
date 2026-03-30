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
