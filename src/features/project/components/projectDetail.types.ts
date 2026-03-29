import type { Project } from '@/contexts/appContext.types';

export interface ProjectDetailTask {
  id?: string;
  title?: string;
  titulo?: string;
  description?: string;
  descripcion?: string;
  status?: string;
  priority?: string;
  prioridad?: string;
  responsable?: string;
  assigned_to?: string;
  assignedTo?: string;
  assigned_role?: string;
  assignedRole?: string;
  forClient?: boolean;
  cliente?: boolean;
  fechaLimite?: string;
  dueDate?: string;
}

export interface ProjectDetailPhase {
  key: string;
  estado?: string;
  descripcion?: string;
  fechaEntrega?: string;
  fechaInicio?: string;
  fechaFin?: string;
  tareas?: ProjectDetailTask[];
}

export interface ProjectDetailProject extends Omit<Project, 'fases' | 'tareas'> {
  completion_percentage?: number;
  progress?: number;
  updated_at: string;
  fases?: ProjectDetailPhase[];
  tareas?: ProjectDetailTask[];
}
