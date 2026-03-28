import {
  fetchAdminProjectTracking,
  updateAdminProjectTrackingPhases,
  updateAdminProjectTrackingProject,
} from '@/api/admin/adminProjectTracking.api';
import type {
  AdminProjectTrackingPhaseInput,
  AdminProjectTrackingPhase,
  AdminProjectTrackingProject,
  AdminProjectTrackingTaskInput,
  AdminProjectTrackingTask,
} from '@/features/admin/projects-tracking/types/adminProjectTracking';

function toTask(
  rawTask: unknown,
  fallbackKey: string,
  phaseContext?: { key: string; label?: string },
): AdminProjectTrackingTask | null {
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
    phaseKey: phaseContext?.key,
    phaseLabel: phaseContext?.label,
    responsable: typeof task.responsable === 'string' ? task.responsable : undefined,
    assigned_to: typeof task.assigned_to === 'string' ? task.assigned_to : undefined,
    assigned_role: typeof task.assigned_role === 'string' ? task.assigned_role : undefined,
    assignedRole: typeof task.assignedRole === 'string' ? task.assignedRole : undefined,
    fechaLimite: typeof task.fechaLimite === 'string' ? task.fechaLimite : undefined,
    dueDate: typeof task.dueDate === 'string' ? task.dueDate : undefined,
    completed: typeof task.completed === 'boolean' ? task.completed : undefined,
    cliente: task.cliente === true,
    forClient: task.forClient === true,
    source: phaseContext ? { type: 'phase', phaseKey: phaseContext.key } : { type: 'root' },
    raw: task,
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
      .map((task, taskIndex) =>
        toTask(task, `fase-${index + 1}-tarea-${taskIndex + 1}`, {
          key: typeof phase.key === 'string' ? phase.key : `fase-${index + 1}`,
          label: typeof phase.descripcion === 'string' ? phase.descripcion : undefined,
        }),
      )
      .filter((task): task is AdminProjectTrackingTask => task !== null),
    comentariosCount: comments.length,
    raw: phase,
  };
}

function normalizePhaseKey(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || `fase-${Date.now()}`;
}

function omitUndefinedValues(source: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(source).filter(([, value]) => value !== undefined));
}

function buildStoredPhase(
  input: AdminProjectTrackingPhaseInput,
  currentPhase?: AdminProjectTrackingPhase,
): Record<string, unknown> {
  const currentRaw = currentPhase?.raw ?? {};

  return omitUndefinedValues({
    ...currentRaw,
    key: currentPhase?.key ?? normalizePhaseKey(input.descripcion),
    estado: input.estado,
    descripcion: input.descripcion.trim(),
    responsable: input.responsable?.trim() || undefined,
    fechaEntrega: input.fechaEntrega || undefined,
    fechaInicio: typeof currentRaw.fechaInicio === 'string' ? currentRaw.fechaInicio : undefined,
    fechaFin: typeof currentRaw.fechaFin === 'string' ? currentRaw.fechaFin : undefined,
    tareas: Array.isArray(currentRaw.tareas) ? currentRaw.tareas : [],
    comentarios: Array.isArray(currentRaw.comentarios) ? currentRaw.comentarios : [],
    archivos: Array.isArray(currentRaw.archivos) ? currentRaw.archivos : [],
  });
}

function normalizeTaskKey(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || `tarea-${Date.now()}`;
}

function buildStoredTask(
  input: AdminProjectTrackingTaskInput,
  currentTask?: AdminProjectTrackingTask,
): Record<string, unknown> {
  const currentRaw = currentTask?.raw ?? {};

  return omitUndefinedValues({
    ...currentRaw,
    key: currentTask?.key ?? normalizeTaskKey(input.title),
    title: input.title.trim(),
    description: input.description?.trim() || undefined,
    status: input.status,
    priority: input.priority?.trim() || undefined,
    responsable: input.responsable?.trim() || undefined,
    fechaLimite: input.fechaLimite || undefined,
  });
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

export async function saveAdminProjectTrackingPhase(
  project: AdminProjectTrackingProject,
  input: AdminProjectTrackingPhaseInput,
  currentPhaseKey?: string,
): Promise<AdminProjectTrackingProject> {
  const currentPhase = currentPhaseKey
    ? project.phases.find((phase) => phase.key === currentPhaseKey)
    : undefined;

  const nextPhase = buildStoredPhase(input, currentPhase);
  const nextPhases = currentPhase
    ? project.phases.map((phase) => (phase.key === currentPhase.key ? nextPhase : phase.raw))
    : [...project.phases.map((phase) => phase.raw), nextPhase];

  await updateAdminProjectTrackingPhases(project.id, nextPhases);
  return getAdminProjectTracking(project.id);
}

export async function saveAdminProjectTrackingTask(
  project: AdminProjectTrackingProject,
  input: AdminProjectTrackingTaskInput,
  currentTaskKey?: string,
): Promise<AdminProjectTrackingProject> {
  const currentTask = currentTaskKey
    ? [...project.rootTasks, ...project.phases.flatMap((phase) => phase.tareas)].find((task) => task.key === currentTaskKey)
    : undefined;

  const targetPhaseKey = currentTask?.source.phaseKey ?? input.phaseKey;
  const nextTask = buildStoredTask(input, currentTask);

  const nextRootTasks = currentTask?.source.type === 'root'
    ? project.rootTasks.map((task) => (task.key === currentTask.key ? nextTask : task.raw))
    : !currentTask && !targetPhaseKey
      ? [...project.rootTasks.map((task) => task.raw), nextTask]
      : project.rootTasks.map((task) => task.raw);

  const nextPhases = project.phases.map((phase) => {
    const currentTasks = phase.tareas.map((task) => task.raw);

    if (currentTask?.source.type === 'phase' && phase.key === currentTask.source.phaseKey) {
      return {
        ...phase.raw,
        tareas: phase.tareas.map((task) => (task.key === currentTask.key ? nextTask : task.raw)),
      };
    }

    if (!currentTask && targetPhaseKey && phase.key === targetPhaseKey) {
      return {
        ...phase.raw,
        tareas: [...currentTasks, nextTask],
      };
    }

    return {
      ...phase.raw,
      tareas: currentTasks,
    };
  });

  await updateAdminProjectTrackingProject(project.id, {
    fases: nextPhases,
    tareas: nextRootTasks,
  });

  return getAdminProjectTracking(project.id);
}
