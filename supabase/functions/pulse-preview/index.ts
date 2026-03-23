// @ts-expect-error - Deno runtime
/// <reference lib="deno.window" />
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// @ts-expect-error - Deno import for Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const DEFAULT_ALLOWED_ORIGIN = 'https://tuweb-ai.com';
const DEFAULT_MAX_AGE = 'public, max-age=3600';

interface PulseUserRow {
  id: string;
}

interface ProjectRow {
  id: string;
}

interface MetricRow {
  visits: number | null;
}

function getAllowedOrigin(): string {
  return Deno.env.get('PULSE_PREVIEW_ALLOWED_ORIGIN') || DEFAULT_ALLOWED_ORIGIN;
}

function getCorsHeaders(origin: string | null) {
  const allowedOrigin = getAllowedOrigin();
  const safeOrigin = origin && origin === allowedOrigin ? origin : allowedOrigin;

  return {
    'Access-Control-Allow-Origin': safeOrigin,
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Cache-Control': DEFAULT_MAX_AGE,
    Vary: 'Origin'
  };
}

function createSupabaseAdminClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

function jsonResponse(status: number, body: Record<string, unknown>, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...getCorsHeaders(origin),
      'Content-Type': 'application/json'
    }
  });
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getCurrentMonthRange() {
  const now = new Date();
  const fromDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const toDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0));

  const format = (date: Date) => date.toISOString().slice(0, 10);

  return {
    from: format(fromDate),
    to: format(toDate),
    label: new Intl.DateTimeFormat('es-AR', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(fromDate)
  };
}

serve(async (req) => {
  const origin = req.headers.get('Origin');

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: getCorsHeaders(origin)
    });
  }

  if (req.method !== 'GET') {
    return jsonResponse(405, { error: 'Method Not Allowed' }, origin);
  }

  const email = new URL(req.url).searchParams.get('email')?.trim().toLowerCase() || '';

  if (!isValidEmail(email)) {
    return jsonResponse(400, { error: 'email is invalid' }, origin);
  }

  const { from, to, label } = getCurrentMonthRange();
  const supabase = createSupabaseAdminClient();

  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (userError) {
      throw userError;
    }

    const pulseUser = user as PulseUserRow | null;

    if (!pulseUser?.id) {
      return jsonResponse(200, { hasData: false }, origin);
    }

    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('created_by', pulseUser.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (projectError) {
      throw projectError;
    }

    const pulseProject = project as ProjectRow | null;

    if (!pulseProject?.id) {
      return jsonResponse(200, { hasData: false }, origin);
    }

    const { data: metrics, error: metricsError } = await supabase
      .from('pulse_metrics')
      .select('visits')
      .eq('project_id', pulseProject.id)
      .gte('metric_date', from)
      .lte('metric_date', to);

    if (metricsError) {
      throw metricsError;
    }

    const totalVisits = ((metrics || []) as MetricRow[]).reduce((total, row) => total + (row.visits || 0), 0);

    if (totalVisits <= 0) {
      return jsonResponse(200, { hasData: false }, origin);
    }

    return jsonResponse(
      200,
      {
        hasData: true,
        visits: totalVisits,
        month: label
      },
      origin
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error en pulse-preview:', message);
    return jsonResponse(500, { error: 'Internal Server Error' }, origin);
  }
});
