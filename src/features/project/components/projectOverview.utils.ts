import type { ProjectDetailPhase, ProjectDetailProject, ProjectDetailTask } from './projectDetail.types';
import type { ProjectsPageProject } from './projectPage.types';

type ProjectsPageTask = NonNullable<ProjectsPageProject['tareas']>[number];

function toDetailTask(task: ProjectsPageTask): ProjectDetailTask {
  return {
    assignedRole: typeof task.assignedRole === 'string' ? task.assignedRole : undefined,
    assigned_to: task.assigned_to,
    cliente: task.cliente,
    descripcion: task.descripcion,
    dueDate: task.dueDate,
    fechaLimite: task.fechaLimite,
    forClient: task.forClient,
    id: task.id,
    prioridad: task.prioridad,
    priority: task.priority,
    responsable: task.responsable,
    status: task.status,
    title: task.title,
    titulo: task.titulo,
  };
}

function toDetailPhase(phase: NonNullable<ProjectsPageProject['fases']>[number]): ProjectDetailPhase {
  return {
    descripcion: phase.descripcion,
    estado: phase.estado,
    tareas: Array.isArray(phase.tareas)
      ? phase.tareas.map(toDetailTask)
      : Array.isArray(phase.tasks)
        ? phase.tasks.map(toDetailTask)
        : undefined,
    key: phase.key,
  };
}

export function toProjectDetailProject(project: ProjectsPageProject): ProjectDetailProject {
  return {
    ...project,
    completion_percentage: project.completion_percentage ?? undefined,
    fases: Array.isArray(project.fases) ? project.fases.map(toDetailPhase) : undefined,
    progress: project.progress ?? undefined,
    tareas: Array.isArray(project.tareas) ? project.tareas.map(toDetailTask) : undefined,
  };
}
