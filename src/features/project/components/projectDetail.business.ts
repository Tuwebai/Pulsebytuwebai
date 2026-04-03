import type { ProjectDetailProject } from './projectDetail.types';
import { getClientPendingTasks, getCurrentPhase, getPhaseDisplayName } from './projectDetail.utils';

export function getProjectBusinessSummary(project: ProjectDetailProject): string {
  const pendingTasks = getClientPendingTasks(project);
  const phaseName = getPhaseDisplayName(getCurrentPhase(project));

  if (pendingTasks.length > 0) {
    return 'Estamos avanzando, pero ahora necesitamos una respuesta tuya para seguir sin demoras.';
  }

  if (project.status === 'production') {
    return 'Tu web ya está entregada. Si aparece una mejora o ajuste, el equipo te lo va a señalar desde acá.';
  }

  if (project.status === 'paused') {
    return 'El proyecto está pausado por ahora. Cuando retomemos el próximo paso, vas a verlo reflejado en esta vista.';
  }

  if (project.status === 'maintenance') {
    return 'Tu sitio ya está activo y el equipo está enfocado en seguimiento, mejoras y ajustes puntuales.';
  }

  if (phaseName) {
    return `Ahora mismo el equipo está trabajando en ${phaseName.toLowerCase()}.`;
  }

  return 'El equipo está avanzando en tu proyecto y te vamos a avisar cuando haya una novedad importante.';
}

export function getProjectNextStepTitle(project: ProjectDetailProject): string {
  const pendingTasks = getClientPendingTasks(project);
  const phaseName = getPhaseDisplayName(getCurrentPhase(project));

  if (pendingTasks.length > 0) {
    return 'Esperamos tu respuesta';
  }

  if (project.status === 'production') {
    return 'Tu web ya está entregada';
  }

  if (project.status === 'paused') {
    return 'Queda pendiente retomar el proyecto';
  }

  return phaseName ? `Seguimos con ${phaseName}` : 'Seguimos avanzando con tu proyecto';
}

export function getProjectNextStepDescription(project: ProjectDetailProject): string {
  const pendingTasks = getClientPendingTasks(project);
  const phaseName = getPhaseDisplayName(getCurrentPhase(project));

  if (pendingTasks.length > 0) {
    return 'Cuando completes lo pendiente, el equipo puede pasar a la siguiente etapa sin perder ritmo.';
  }

  if (project.status === 'production') {
    return 'Desde acá vas a seguir viendo el estado general y cualquier ajuste importante que aparezca después de la entrega.';
  }

  if (project.status === 'paused') {
    return 'Si necesitás reactivar el trabajo o revisar prioridades, podés escribirle al equipo desde este mismo detalle.';
  }

  if (phaseName) {
    return `La próxima novedad importante va a llegar cuando ${phaseName.toLowerCase()} quede lista para mostrarte el resultado.`;
  }

  return 'Cuando haya un avance relevante, lo vas a ver reflejado en esta pantalla sin tener que pedirlo.';
}

export function getProjectClientActionTitle(project: ProjectDetailProject): string {
  const pendingTasks = getClientPendingTasks(project);

  if (pendingTasks.length === 0) {
    return 'No necesitás hacer nada ahora';
  }

  return pendingTasks.length === 1 ? 'Tenés 1 pendiente de tu parte' : `Tenés ${pendingTasks.length} pendientes de tu parte`;
}

export function getProjectClientActionDetail(project: ProjectDetailProject): string {
  const pendingTasks = getClientPendingTasks(project);

  if (pendingTasks.length === 0) {
    return 'Podés seguir este avance tranquilo. El equipo te va a avisar si necesita una definición, material o aprobación.';
  }

  return 'Respondé o completá lo que falta para que el equipo pueda seguir avanzando sin fricción.';
}
