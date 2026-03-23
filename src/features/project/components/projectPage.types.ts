import type { Project } from '@/contexts/appContext.types';

export interface ProjectPhaseTask {
  id?: string;
  status?: string;
}

export interface ProjectsPagePhase {
  key: string;
  estado: 'Pendiente' | 'En Progreso' | 'Terminado' | 'En Revisión' | 'Aprobada' | 'Bloqueada';
  descripcion?: string;
  tasks?: ProjectPhaseTask[];
  comments?: unknown[];
  comentarios?: unknown[];
}

export interface ProjectsPageProject extends Project {
  progress?: number;
  phases?: Array<{
    tasks?: ProjectPhaseTask[];
    comments?: unknown[];
  }>;
  collaborators?: unknown[];
  notifications?: unknown[];
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}
