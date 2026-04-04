export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-pulse-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
} as const;

export const DEFAULT_SYNC_DAYS = 28;
export const MAX_SYNC_DAYS = 90;

export class SyncSearchConsoleError extends Error {
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

export interface SearchConsolePropertyRow {
  id: string;
  project_id: string;
  site_url: string;
}

export interface SearchConsoleCredentialRow {
  refresh_token_ciphertext: string;
  refresh_token_iv: string;
}

export interface SearchConsoleDailyMetricRow {
  clicks: number;
  ctr: number;
  impressions: number;
  metric_date: string;
  position: number;
  project_id: string;
  property_id: string;
  raw_payload: Record<string, unknown>;
  updated_at: string;
}

export interface SearchConsoleDimensionMetricRow {
  clicks: number;
  ctr: number;
  dimension_key: string;
  dimension_type: 'page' | 'query';
  impressions: number;
  metric_window_from: string;
  metric_window_to: string;
  position: number;
  project_id: string;
  property_id: string;
  updated_at: string;
}
