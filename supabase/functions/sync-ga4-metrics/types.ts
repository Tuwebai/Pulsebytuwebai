export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
} as const;

export const DRY_RUN = Deno.env.get('GA4_DRY_RUN') === 'true';
export const MAX_BOOTSTRAP_DAYS = 90;
export const DEFAULT_BOOTSTRAP_DAYS = 30;

export interface ProjectRow {
  id: string;
  ga4_property_id: string;
  domain: string | null;
  created_by: string | null;
}

export interface UserPreferenceRow {
  notif_new_consultation: boolean | null;
}

export interface ConsultationAlertRecipient {
  id: string;
  email: string | null;
  full_name: string | null;
  notif_new_consultation: boolean | null;
}

export interface Ga4Metrics {
  sessions: number;
  conversions: number;
  avgSessionSec: number;
  topPage: string | null;
  topPageViews: number;
  topPages: Array<{ label?: string | null; path: string; visits: number }>;
  raw: unknown;
}

export interface SyncRequestBody {
  projectId?: string;
  days?: number;
}

export interface SyncRequestContext {
  mode: 'cron' | 'bootstrap';
  days: number;
  includeToday: boolean;
  projectId: string | null;
  canNotify: boolean;
}

export class SyncGa4MetricsError extends Error {
  constructor(
    public readonly status: number,
    public readonly publicMessage: string,
    public readonly code: string,
  ) {
    super(code);
  }
}

export function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}
