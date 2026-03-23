export type Period = 'this_month' | 'last_month' | 'last_7_days' | 'last_30_days' | 'this_year';

export interface PulseMetricRow {
  id: string;
  project_id: string;
  date: string;
  visits: number;
  contacts: number;
  top_page: string | null;
  top_page_visits: number;
  avg_session_sec: number;
}

export interface TopPage {
  path: string;
  visits: number;
  percentage: number;
}

export interface ChartDataPoint {
  date: string;
  visits: number;
  contacts: number;
}

export interface PulseMetricsTotals {
  visits: number;
  contacts: number;
  visitsDelta: number | null;
  contactsDelta: number | null;
  avgSessionSec: number;
  topPages: TopPage[];
  chartData: ChartDataPoint[];
  period: Period;
  dateRange: {
    from: string;
    to: string;
  };
  hasData: boolean;
}
