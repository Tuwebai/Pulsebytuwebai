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
  top_pages: TopPage[];
  updated_at: string | null;
}

export interface TopPage {
  label?: string | null;
  path: string;
  visits: number;
  percentage: number;
}

export interface ChartDataPoint {
  date: string;
  previousContacts: number | null;
  previousVisits: number | null;
  visits: number;
  contacts: number;
}

export interface PulseMetricsTotals {
  visits: number;
  contacts: number;
  visitsDelta: number | null;
  contactsDelta: number | null;
  consultationRate: number | null;
  avgSessionSec: number;
  topPages: TopPage[];
  chartData: ChartDataPoint[];
  period: Period;
  dateRange: {
    from: string;
    to: string;
  };
  hasData: boolean;
  lastUpdatedAt: string | null;
}

export interface PulseRealtimePage {
  label: string;
  activeUsers: number;
  views: number;
}

export interface PulseRealtimeEvent {
  name: string;
  count: number;
  keyEvents: number;
}

export interface PulseRealtimeSnapshot {
  activeUsers: number;
  pageViews: number;
  ctaClicks: number;
  topPages: PulseRealtimePage[];
  topEvents: PulseRealtimeEvent[];
  sampledAt: string;
}
