// @ts-expect-error - Deno import for Supabase
import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface RateLimitParams {
  action: string;
  key: string;
  limit: number;
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

function createSupabaseAdminClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function enforceRateLimit(params: RateLimitParams): Promise<RateLimitResult> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc('consume_edge_rate_limit', {
    p_action: params.action,
    p_key: params.key,
    p_limit: params.limit,
    p_window_seconds: params.windowSeconds,
  });

  if (error) {
    throw error;
  }

  const result = Array.isArray(data) ? data[0] : data;
  return {
    allowed: Boolean(result?.allowed),
    remaining: Number(result?.remaining ?? 0),
    retryAfterSeconds: Number(result?.retry_after_seconds ?? params.windowSeconds),
  };
}

export function getRequestIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  return req.headers.get('cf-connecting-ip') || 'unknown';
}
