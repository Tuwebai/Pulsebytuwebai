import { supabase } from '@/lib/supabase';
import type { PulseMetricRow } from '@/data/types/pulse';

interface PulseMetricApiRow {
  id: string;
  project_id: string;
  metric_date: string;
  visits: number | null;
  contacts: number | null;
  top_page: string | null;
  top_page_visits: number | null;
  avg_session_sec: number | null;
}

export async function fetchMetricsByRange(projectId: string, from: string, to: string): Promise<PulseMetricRow[]> {
  const { data, error } = await supabase
    .from('pulse_metrics')
    .select('id, project_id, metric_date, visits, contacts, top_page, top_page_visits, avg_session_sec')
    .eq('project_id', projectId)
    .gte('metric_date', from)
    .lte('metric_date', to)
    .order('metric_date', { ascending: true });

  if (error) {
    throw new Error(`No pudimos consultar pulse_metrics para ${projectId}: ${error.message}`);
  }

  return ((data || []) as PulseMetricApiRow[]).map((row) => ({
    id: row.id,
    project_id: row.project_id,
    date: row.metric_date,
    visits: row.visits || 0,
    contacts: row.contacts || 0,
    top_page: row.top_page,
    top_page_visits: row.top_page_visits || 0,
    avg_session_sec: row.avg_session_sec || 0
  }));
}
