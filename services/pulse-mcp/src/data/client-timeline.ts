import { fetchClientOverview } from './client-overview.js';

type TimelineEvent = {
  id: string;
  type: 'project' | 'metric' | 'notification' | 'ticket';
  title: string;
  description: string;
  occurred_at: string | null;
};

function buildTimelineEvents(overview: Awaited<ReturnType<typeof fetchClientOverview>>) {
  const events: TimelineEvent[] = [];
  const latestMetric = overview.metrics?.series.at(-1) ?? null;

  if (overview.project) {
    events.push({
      id: `project:${overview.project.id}`,
      type: 'project',
      title: overview.project.name || 'Proyecto Pulse',
      description: `Estado ${overview.project.status || 'sin_estado'}${overview.project.domain ? ` · ${overview.project.domain}` : ''}`,
      occurred_at: overview.project.updated_at ?? overview.project.created_at ?? null,
    });
  }

  if (latestMetric) {
    events.push({
      id: `metric:${latestMetric.date}`,
      type: 'metric',
      title: 'Última métrica registrada',
      description: `${latestMetric.visits} visitas y ${latestMetric.contacts} contactos`,
      occurred_at: latestMetric.date,
    });
  }

  for (const notification of overview.notifications.latest) {
    events.push({
      id: `notification:${notification.id}`,
      type: 'notification',
      title: notification.title || 'Notificación Pulse',
      description: notification.message || 'Notificación operativa sin mensaje adicional.',
      occurred_at: notification.created_at ?? null,
    });
  }

  for (const ticket of overview.support.latest) {
    events.push({
      id: `ticket:${ticket.id}`,
      type: 'ticket',
      title: ticket.asunto || 'Ticket de soporte',
      description: ticket.lastMessage?.content || `Estado ${ticket.estado || ticket.status || 'sin_estado'}`,
      occurred_at: ticket.lastMessage?.created_at ?? ticket.updated_at ?? ticket.created_at ?? null,
    });
  }

  return events.sort((left, right) => {
    const leftTime = left.occurred_at ? new Date(left.occurred_at).getTime() : 0;
    const rightTime = right.occurred_at ? new Date(right.occurred_at).getTime() : 0;
    return rightTime - leftTime;
  });
}

export async function fetchClientTimeline(userId: string) {
  const overview = await fetchClientOverview(userId);

  return {
    ...overview,
    timeline: buildTimelineEvents(overview),
  };
}
