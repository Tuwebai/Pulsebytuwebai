import { fetchAdminProjectTracking } from '@/api/admin/adminProjectTracking.api';
import type {
  AdminProjectTrackingPhase,
  AdminProjectTrackingProject,
  AdminProjectTrackingTask,
} from '@/features/admin/projects-tracking/types/adminProjectTracking';

function toTask(rawTask: unknown, fallbackKey: string): AdminProjectTrackingTask | null {
  if (!rawTask || typeof rawTask !== 'object') {
    return null;
  }

  const task = rawTask as Record<string, unknown>;
  const title = typeof task.title === 'string' ? task.title : typeof task.titulo === 'string' ? task.titulo : null;

  if (!title) {
    return null;
  }

  return {
    key: typeof task.key === 'string' ? task.key : fallbackKey,
    title,
    description: typeof task.description === 'string' ? task.description : undefined,
    status: typeof task.status === 'string' ? task.status : 'pending',
    priority: typeof task.priority === 'string' ? task.priority : typeof task.prioridad === 'string' ? task.prioridad : undefined,
    responsable: typeof task.responsable === 'string' ? task.responsable : undefined,
    assigned_to: typeof task.assigned_to === 'string' ? task.assigned_to : undefined,
    assigned_role: typeof task.assigned_role === 'string' ? task.assigned_role : undefined,
    assignedRole: typeof task.assignedRole === 'string' ? task.assignedRole : undefined,
    fechaLimite: typeof task.fechaLimite === 'string' ? task.fechaLimite : undefined,
    dueDate: typeof task.dueDate === 'string' ? task.dueDate : undefined,
    completed: typeof task.completed === 'boolean' ? task.completed : undefined,
    cliente: task.cliente === true,
    forClient: task.forClient === true,
  };
}

function toPhase(rawPhase: unknown, index: number): AdminProjectTrackingPhase | null {
  if (!rawPhase || typeof rawPhase !== 'object') {
    return null;
  }

  const phase = rawPhase as Record<string, unknown>;
  const phaseTasks = Array.isArray(phase.tareas) ? phase.tareas : [];
  const comments = Array.isArray(phase.comentarios) ? phase.comentarios : [];

  return {
    key: typeof phase.key === 'string' ? phase.key : `fase-${index + 1}`,
    estado: typeof phase.estado === 'string' ? phase.estado : 'Pendiente',
    descripcion: typeof phase.descripcion === 'string' ? phase.descripcion : undefined,
    fechaEntrega: typeof phase.fechaEntrega === 'string' ? phase.fechaEntrega : undefined,
    fechaInicio: typeof phase.fechaInicio === 'string' ? phase.fechaInicio : undefined,
    fechaFin: typeof phase.fechaFin === 'string' ? phase.fechaFin : undefined,
    responsable: typeof phase.responsable === 'string' ? phase.responsable : undefined,
    tareas: phaseTasks
      .map((task, taskIndex) => toTask(task, `fase-${index + 1}-tarea-${taskIndex + 1}`))
      .filter((task): task is AdminProjectTrackingTask => task !== null),
    comentariosCount: comments.length,
  };
}

export async function getAdminProjectTracking(projectId: string): Promise<AdminProjectTrackingProject> {
  const row = await fetchAdminProjectTracking(projectId);
  const phases = Array.isArray(row.fases) ? row.fases : [];
  const rootTasks = Array.isArray(row.tareas) ? row.tareas : [];

  return {
    id: row.id,
    name: row.name,
    status: row.status ?? 'development',
    priority: row.priority ?? undefined,
    progress: row.progress ?? row.completion_percentage ?? 0,
    completionPercentage: row.completion_percentage ?? row.progress ?? 0,
    approvalStatus: row.approval_status ?? undefined,
    updatedAt: row.updated_at,
    startDate: row.start_date ?? undefined,
    endDate: row.end_date ?? undefined,
    phases: phases
      .map((phase, index) => toPhase(phase, index))
      .filter((phase): phase is AdminProjectTrackingPhase => phase !== null),
    rootTasks: rootTasks
      .map((task, index) => toTask(task, `tarea-${index + 1}`))
      .filter((task): task is AdminProjectTrackingTask => task !== null),
  };
}
