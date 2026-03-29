import type { ProjectDetailPhase, ProjectDetailProject, ProjectDetailTask } from './projectDetail.types';
import type { ProjectsPageProject } from './projectPage.types';

function toDetailTask(task: Record<string, unknown>): ProjectDetailTask {
  return {
    assignedRole: typeof task.assignedRole === 'string' ? task.assignedRole : undefined,
    assigned_to: typeof task.assigned_to === 'string' ? task.assigned_to : undefined,
    cliente: typeof task.cliente === 'boolean' ? task.cliente : undefined,
    descripcion: typeof task.descripcion === 'string' ? task.descripcion : undefined,
    dueDate: typeof task.dueDate === 'string' ? task.dueDate : undefined,
    fechaLimite: typeof task.fechaLimite === 'string' ? task.fechaLimite : undefined,
    forClient: typeof task.forClient === 'boolean' ? task.forClient : undefined,
    id: typeof task.id === 'string' ? task.id : undefined,
    prioridad: typeof task.prioridad === 'string' ? task.prioridad : undefined,
    priority: typeof task.priority === 'string' ? task.priority : undefined,
    responsable: typeof task.responsable === 'string' ? task.responsable : undefined,
    status: typeof task.status === 'string' ? task.status : undefined,
    title: typeof task.title === 'string' ? task.title : undefined,
    titulo: typeof task.titulo === 'string' ? task.titulo : undefined,
  };
}

function toDetailPhase(phase: NonNullable<ProjectsPageProject['fases']>[number]): ProjectDetailPhase {
  return {
    descripcion: phase.descripcion,
    estado: phase.estado,
    key: phase.key,
  };
}

export function toProjectDetailProject(project: ProjectsPageProject): ProjectDetailProject {
  return {
    ...project,
    completion_percentage: project.completion_percentage ?? undefined,
    fases: Array.isArray(project.fases) ? project.fases.map(toDetailPhase) : undefined,
    progress: project.progress ?? undefined,
    tareas: Array.isArray(project.tareas)
      ? project.tareas.map((task: Record<string, unknown>) => toDetailTask(task))
      : undefined,
  };
}
