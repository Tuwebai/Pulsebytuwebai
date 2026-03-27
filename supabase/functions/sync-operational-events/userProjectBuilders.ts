import type { ManagedEventInput, ManagedEventRecord, ProjectRow, UserRow } from './shared.ts';
import { buildEventKey, getPersistedStatus } from './shared.ts';

export function createUserEvents(
  users: UserRow[],
  latestProjectByUser: Map<string, ProjectRow>,
  existingByKey: Map<string, ManagedEventRecord>,
): ManagedEventInput[] {
  const events: ManagedEventInput[] = [];

  users.forEach((user) => {
    const latestProject = latestProjectByUser.get(user.id);

    if (!user.onboarding_completed) {
      const existingEvent = existingByKey.get(buildEventKey({ client_id: user.id, type: 'onboarding_incomplete', source_type: 'onboarding', source_id: null }));
      events.push({
        client_id: user.id,
        type: 'onboarding_incomplete',
        severity: 'medium',
        status: getPersistedStatus(existingEvent),
        title: 'Onboarding incompleto',
        description: 'El cliente todavía no terminó la puesta en marcha inicial de Pulse.',
        impact: 'Pulse no puede entrar en operación completa para este cliente.',
        suggested_action: 'Contactar al cliente y completar el onboarding operativo.',
        owner_id: existingEvent?.owner_id ?? null,
        source_type: 'onboarding',
        source_id: null,
        snoozed_until: existingEvent?.snoozed_until ?? null,
      });
    }

    if (user.website_status === 'approved' && user.website && !latestProject) {
      const existingEvent = existingByKey.get(buildEventKey({ client_id: user.id, type: 'client_no_pulse_data', source_type: 'system', source_id: null }));
      events.push({
        client_id: user.id,
        type: 'client_no_pulse_data',
        severity: 'high',
        status: getPersistedStatus(existingEvent),
        title: 'Cliente sin datos Pulse',
        description: 'El cliente tiene sitio aprobado pero todavía no tiene proyecto operativo conectado.',
        impact: 'Pulse no puede mostrar métricas ni estado real del cliente.',
        suggested_action: 'Crear o vincular el proyecto operativo del cliente.',
        owner_id: existingEvent?.owner_id ?? null,
        source_type: 'system',
        source_id: null,
        snoozed_until: existingEvent?.snoozed_until ?? null,
      });
    }

    if (!latestProject?.id) return;

    if (user.website_status === 'approved' && !latestProject.domain) {
      const existingEvent = existingByKey.get(buildEventKey({ client_id: user.id, type: 'domain_not_connected', source_type: 'domain', source_id: latestProject.id }));
      events.push({
        client_id: user.id,
        type: 'domain_not_connected',
        severity: 'high',
        status: getPersistedStatus(existingEvent),
        title: 'Dominio sin conectar',
        description: 'El cliente fue aprobado pero el proyecto todavía no tiene dominio operativo.',
        impact: 'Sin operación web confiable para Pulse.',
        suggested_action: 'Configurar el dominio del proyecto y validar su conexión.',
        owner_id: existingEvent?.owner_id ?? null,
        source_type: 'domain',
        source_id: latestProject.id,
        snoozed_until: existingEvent?.snoozed_until ?? null,
      });
    }

    if (user.website_status === 'approved' && latestProject.domain && !latestProject.ga4_property_id) {
      const existingEvent = existingByKey.get(buildEventKey({ client_id: user.id, type: 'ga4_not_connected', source_type: 'project', source_id: latestProject.id }));
      events.push({
        client_id: user.id,
        type: 'ga4_not_connected',
        severity: 'high',
        status: getPersistedStatus(existingEvent),
        title: 'GA4 sin conectar',
        description: `El proyecto ${latestProject.name ?? 'del cliente'} no tiene propiedad de GA4 configurada.`,
        impact: 'Pulse no puede mostrar métricas confiables del sitio.',
        suggested_action: 'Configurar GA4 y validar la ingestión de métricas.',
        owner_id: existingEvent?.owner_id ?? null,
        source_type: 'project',
        source_id: latestProject.id,
        snoozed_until: existingEvent?.snoozed_until ?? null,
      });
    }
  });

  return events;
}

export function createProjectApprovalEvents(projects: ProjectRow[], existingByKey: Map<string, ManagedEventRecord>): ManagedEventInput[] {
  return projects
    .filter((project) => project.created_by && project.approval_status === 'pending')
    .map((project) => {
      const existingEvent = existingByKey.get(buildEventKey({ client_id: project.created_by as string, type: 'project_approval_pending', source_type: 'project', source_id: project.id }));
      return {
        client_id: project.created_by as string,
        type: 'project_approval_pending',
        severity: 'high',
        status: getPersistedStatus(existingEvent),
        title: 'Aprobación de proyecto pendiente',
        description: `El proyecto ${project.name ?? 'sin nombre'} sigue esperando revisión administrativa.`,
        impact: 'El cliente no puede avanzar con el flujo operativo de Pulse.',
        suggested_action: 'Revisar la solicitud y aprobar o rechazar el proyecto.',
        owner_id: existingEvent?.owner_id ?? null,
        source_type: 'project',
        source_id: project.id,
        snoozed_until: existingEvent?.snoozed_until ?? null,
      };
    });
}
