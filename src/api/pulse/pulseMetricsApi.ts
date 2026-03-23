import { supabase } from '@/lib/supabase';

export interface PulseMetricRecord {
  id: string;
  project_id: string;
  metric_date: string;
  visits: number;
  contacts: number;
  top_page: string | null;
  top_page_visits: number;
  avg_session_sec: number;
  top_pages: unknown;
  raw_ga4_data: unknown;
  created_at: string;
  updated_at: string;
}

export const pulseMetricsApi = {
  async getMetricsByProject(projectId: string, startDate: string, endDate: string): Promise<PulseMetricRecord[]> {
    const { data, error } = await supabase
      .from('pulse_metrics')
      .select(
        'id, project_id, metric_date, visits, contacts, top_page, top_page_visits, avg_session_sec, top_pages, raw_ga4_data, created_at, updated_at'
      )
      .eq('project_id', projectId)
      .gte('metric_date', startDate)
      .lte('metric_date', endDate)
      .order('metric_date', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  }
};
