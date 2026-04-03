import { type PulsePeriod, getDateRange } from '../date-ranges.js';
import { supabase } from './client.js';

export async function fetchDashboardSummary(period: PulsePeriod) {
  const currentRange = getDateRange(period);
  const [clientsResult, projectsResult, metricsResult] = await Promise.all([
    supabase.from('users').select('id, onboarding_completed, pulse_access_status, role').eq('role', 'user'),
    supabase.from('projects').select('id, status, ga4_property_id, created_by'),
    supabase.from('pulse_metrics').select('visits, contacts').gte('metric_date', currentRange.from).lte('metric_date', currentRange.to),
  ]);

  if (clientsResult.error) throw clientsResult.error;
  if (projectsResult.error) throw projectsResult.error;
  if (metricsResult.error) throw metricsResult.error;

  const clients = (clientsResult.data ?? []) as Array<{ id: string; onboarding_completed?: boolean | null; pulse_access_status?: string | null }>;
  const projects = (projectsResult.data ?? []) as Array<{ status?: string | null; ga4_property_id?: string | null; created_by?: string | null }>;
  const metrics = (metricsResult.data ?? []) as Array<{ visits?: number | null; contacts?: number | null }>;

  const usersWithProject = new Set(projects.map((project) => project.created_by).filter((value): value is string => Boolean(value)));
  const activeProjectsByStatus = projects.reduce<Record<string, number>>((acc, project) => {
    const status = project.status || 'sin_estado';
    acc[status] = (acc[status] ?? 0) + 1;
    return acc;
  }, {});

  return {
    period,
    dateRange: currentRange,
    totals: {
      total_clients: clients.length,
      with_access: clients.filter((client) => client.pulse_access_status === 'active' || client.onboarding_completed === true).length,
      with_project: clients.filter((client) => usersWithProject.has(client.id)).length,
      with_ga4: projects.filter((project) => typeof project.ga4_property_id === 'string' && project.ga4_property_id.length > 0).length,
      total_visits: metrics.reduce((total, row) => total + (row.visits ?? 0), 0),
      total_contacts: metrics.reduce((total, row) => total + (row.contacts ?? 0), 0),
    },
    active_projects_by_status: activeProjectsByStatus,
  };
}
