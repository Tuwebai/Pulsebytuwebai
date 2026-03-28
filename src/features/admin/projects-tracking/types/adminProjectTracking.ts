export interface AdminProjectTrackingTaskSource {
  type: 'root' | 'phase';
  phaseKey?: string;
}

export interface AdminProjectTrackingTask {
  key: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  phaseKey?: string;
  phaseLabel?: string;
  responsable?: string;
  assigned_to?: string;
  assigned_role?: string;
  assignedRole?: string;
  fechaLimite?: string;
  dueDate?: string;
  completed?: boolean;
  cliente?: boolean;
  forClient?: boolean;
  source: AdminProjectTrackingTaskSource;
  raw: Record<string, unknown>;
}

export interface AdminProjectTrackingPhase {
  key: string;
  estado: string;
  descripcion?: string;
  fechaEntrega?: string;
  fechaInicio?: string;
  fechaFin?: string;
  responsable?: string;
  tareas: AdminProjectTrackingTask[];
  comentariosCount: number;
  raw: Record<string, unknown>;
}

export interface AdminProjectTrackingProject {
  id: string;
  name: string;
  status: string;
  priority?: string;
  progress: number;
  completionPercentage: number;
  approvalStatus?: string;
  updatedAt: string;
  startDate?: string;
  endDate?: string;
  phases: AdminProjectTrackingPhase[];
  rootTasks: AdminProjectTrackingTask[];
}

export interface AdminProjectTrackingPhaseInput {
  descripcion: string;
  estado: string;
  responsable?: string;
  fechaEntrega?: string;
}

export interface AdminProjectTrackingTaskInput {
  title: string;
  description?: string;
  status: string;
  priority?: string;
  responsable?: string;
  fechaLimite?: string;
  phaseKey?: string;
}
