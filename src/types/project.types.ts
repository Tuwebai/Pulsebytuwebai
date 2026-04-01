export interface ProjectPhaseComment {
  id: string;
  texto: string;
  autor: string;
  fecha: string;
  tipo: 'admin' | 'cliente';
}

export interface ProjectFile {
  url: string;
  name: string;
}

export interface ProjectTask {
  key: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  completed?: boolean;
}

export interface ProjectPhase {
  key: string;
  estado: 'Pendiente' | 'En Progreso' | 'Terminado';
  descripcion?: string;
  fechaEntrega?: string;
  archivos?: ProjectFile[];
  comentarios?: ProjectPhaseComment[];
  tareas?: ProjectTask[];
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  technologies: string[];
  environment_variables?: Record<string, unknown>;
  status: 'development' | 'production' | 'paused' | 'maintenance';
  github_repository_url?: string;
  customicon?: string;
  screenshot_url?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  is_active: boolean;
  domain?: string | null;
  ga4_property_id?: string | null;
  type?: string;
  funcionalidades?: string[];
  fases?: ProjectPhase[];
  tareas?: ProjectTask[];
  progress?: number;
  completion_percentage?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  start_date?: string;
  end_date?: string;
  approval_status?: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  approval_notes?: string;
  approval_deadline?: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  technologies: string[];
  environment_variables?: Record<string, unknown>;
  status: 'development' | 'production' | 'paused' | 'maintenance';
  github_repository_url?: string;
  customicon?: string;
  screenshot_url?: string;
  funcionalidades?: string[];
  fases?: Project['fases'];
  tareas?: Project['tareas'];
  type?: string;
  priority?: Project['priority'];
  start_date?: string;
  end_date?: string;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  is_active?: boolean;
  progress?: number;
  completion_percentage?: number;
  approval_status?: Project['approval_status'];
  approved_by?: string;
  approved_at?: string;
  approval_notes?: string;
  approval_deadline?: string;
}

export interface ProjectFilters {
  status?: string;
  technology?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ProjectSort {
  field: 'name' | 'status' | 'created_at' | 'updated_at';
  direction: 'asc' | 'desc';
}
