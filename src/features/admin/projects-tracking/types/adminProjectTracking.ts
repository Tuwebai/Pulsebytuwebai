export interface AdminProjectTrackingTask {
  key: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  responsable?: string;
  assigned_to?: string;
  assigned_role?: string;
  assignedRole?: string;
  fechaLimite?: string;
  dueDate?: string;
  completed?: boolean;
  cliente?: boolean;
  forClient?: boolean;
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
