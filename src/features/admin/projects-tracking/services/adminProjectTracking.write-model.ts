import type {
  AdminProjectTrackingPhase,
  AdminProjectTrackingPhaseInput,
  AdminProjectTrackingTask,
  AdminProjectTrackingTaskInput,
} from '@/features/admin/projects-tracking/types/adminProjectTracking';

function normalizeEntityKey(value: string, fallbackPrefix: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || `${fallbackPrefix}-${Date.now()}`;
}

function omitUndefinedValues(source: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(source).filter(([, value]) => value !== undefined));
}

export function buildStoredPhase(
  input: AdminProjectTrackingPhaseInput,
  currentPhase?: AdminProjectTrackingPhase,
): Record<string, unknown> {
  const currentRaw = currentPhase?.raw ?? {};

  return omitUndefinedValues({
    ...currentRaw,
    key: currentPhase?.key ?? normalizeEntityKey(input.descripcion, 'fase'),
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

export function buildStoredTask(
  input: AdminProjectTrackingTaskInput,
  currentTask?: AdminProjectTrackingTask,
): Record<string, unknown> {
  const currentRaw = currentTask?.raw ?? {};

  return omitUndefinedValues({
    ...currentRaw,
    key: currentTask?.key ?? normalizeEntityKey(input.title, 'tarea'),
    title: input.title.trim(),
    description: input.description?.trim() || undefined,
    status: input.status,
    priority: input.priority?.trim() || undefined,
    responsable: input.responsable?.trim() || undefined,
    fechaLimite: input.fechaLimite || undefined,
  });
}
