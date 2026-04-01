import type { Project } from '@/types/project.types';

export interface ProjectPhaseTask {
  id?: string;
  status?: string;
  title?: string;
  titulo?: string;
  responsable?: string;
  assigned_to?: string;
  assignedTo?: string;
  assigned_role?: string;
  assignedRole?: string;
  forClient?: boolean;
  cliente?: boolean;
  priority?: string;
  prioridad?: string;
  dueDate?: string;
  fechaLimite?: string;
  descripcion?: string;
}

export interface ProjectsPagePhase {
  key: string;
  estado: 'Pendiente' | 'En Progreso' | 'Terminado' | 'En Revisión' | 'Aprobada' | 'Bloqueada';
  descripcion?: string;
  tasks?: ProjectPhaseTask[];
  tareas?: ProjectPhaseTask[];
}

export interface ProjectsPageProject extends Omit<Project, 'fases' | 'tareas'> {
  fases?: ProjectsPagePhase[];
  tareas?: ProjectPhaseTask[];
}
