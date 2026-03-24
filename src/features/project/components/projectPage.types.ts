import type { Project } from '@/contexts/appContext.types';

export interface ProjectPhaseTask {
  id?: string;
  status?: string;
  titulo?: string;
  responsable?: string;
  forClient?: boolean;
  cliente?: boolean;
}

export interface ProjectsPagePhase {
  key: string;
  estado: 'Pendiente' | 'En Progreso' | 'Terminado' | 'En Revisión' | 'Aprobada' | 'Bloqueada';
  descripcion?: string;
  tasks?: ProjectPhaseTask[];
  tareas?: ProjectPhaseTask[];
  comments?: unknown[];
  comentarios?: unknown[];
}

export interface ProjectsPageProject extends Project {
  phases?: Array<{
    tasks?: ProjectPhaseTask[];
    tareas?: ProjectPhaseTask[];
    comments?: unknown[];
  }>;
  collaborators?: unknown[];
  notifications?: unknown[];
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}
