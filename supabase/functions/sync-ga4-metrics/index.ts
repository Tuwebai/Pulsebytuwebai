// @ts-expect-error - Deno runtime
/// <reference lib="deno.window" />
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// @ts-expect-error - Deno import for Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const DRY_RUN = Deno.env.get('GA4_DRY_RUN') === 'true';
const GA4_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';

interface ProjectRow {
  id: string;
  ga4_property_id: string;
  domain: string | null;
  created_by: string | null;
}

interface UserPreferenceRow {
  notif_new_consultation: boolean | null;
}

interface Ga4Metrics {
  sessions: number;
  conversions: number;
  avgSessionSec: number;
  topPage: string | null;
  topPageViews: number;
  topPages: Array<{ path: string; visits: number }>;
  raw: unknown;
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

function base64UrlEncode(input: string | Uint8Array): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function importPrivateKey(privateKeyPem: string): Promise<CryptoKey> {
  const normalized = privateKeyPem
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s+/g, '');

  const binary = Uint8Array.from(atob(normalized), (char) => char.charCodeAt(0));

  return crypto.subtle.importKey(
    'pkcs8',
    binary.buffer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    false,
    ['sign']
  );
}

async function getGoogleAccessToken(credentialsJson: string): Promise<string> {
  const credentials = JSON.parse(credentialsJson) as {
    client_email?: string;
    private_key?: string;
    token_uri?: string;
  };

  if (!credentials.client_email || !credentials.private_key) {
    throw new Error('GOOGLE_ANALYTICS_CREDENTIALS no tiene client_email/private_key validos.');
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: credentials.client_email,
    scope: GA4_SCOPE,
    aud: credentials.token_uri || 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const unsignedToken = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}`;
  const privateKey = await importPrivateKey(credentials.private_key);
  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', privateKey, new TextEncoder().encode(unsignedToken));
  const signedJwt = `${unsignedToken}.${base64UrlEncode(new Uint8Array(signature))}`;

  const tokenResponse = await fetch(credentials.token_uri || 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: signedJwt
    })
  });

  if (!tokenResponse.ok) {
    throw new Error(`No pudimos obtener access token de Google: ${tokenResponse.status} ${await tokenResponse.text()}`);
  }

  const tokenData = await tokenResponse.json();

  if (!tokenData.access_token) {
    throw new Error('Google no devolvio access_token.');
  }

  return tokenData.access_token as string;
}

function parseGa4Response(raw: unknown): Ga4Metrics {
  const response = raw as {
    rows?: Array<{
      dimensionValues?: Array<{ value?: string }>;
      metricValues?: Array<{ value?: string }>;
    }>;
  };

  const rows = response.rows || [];
  const topPages = rows.slice(0, 5).map((row) => ({
    path: row.dimensionValues?.[0]?.value || '/',
    visits: parseInt(row.metricValues?.[3]?.value || '0', 10)
  }));

  const sessions = rows.reduce((total, row) => total + parseInt(row.metricValues?.[0]?.value || '0', 10), 0);
  const conversions = rows.reduce((total, row) => total + parseInt(row.metricValues?.[1]?.value || '0', 10), 0);
  const durationBase = rows.reduce((total, row) => total + parseFloat(row.metricValues?.[2]?.value || '0'), 0);
  const avgSessionSec = rows.length > 0 ? Math.round(durationBase / rows.length) : 0;

  return {
    sessions,
    conversions,
    avgSessionSec,
    topPage: topPages[0]?.path || null,
    topPageViews: topPages[0]?.visits || 0,
    topPages,
    raw
  };
}

async function fetchGA4Metrics(propertyId: string, date: string, credentialsJson: string): Promise<Ga4Metrics> {
  const token = await getGoogleAccessToken(credentialsJson);

  const body = {
    dateRanges: [{ startDate: date, endDate: date }],
    metrics: [
      { name: 'sessions' },
      { name: 'conversions' },
      { name: 'averageSessionDuration' },
      { name: 'screenPageViews' }
    ],
    dimensions: [{ name: 'pagePath' }],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 10
  };

  const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`GA4 API error: ${response.status} ${await response.text()}`);
  }

  const raw = await response.json();
  return parseGa4Response(raw);
}

function buildDryRunMetrics(project: ProjectRow, date: string): Ga4Metrics {
  const seed = project.id.replace(/-/g, '').slice(0, 8);
  const numericSeed = parseInt(seed, 16);
  const sessions = 20 + (numericSeed % 120);
  const conversions = numericSeed % 7;
  const topPages = [
    { path: '/', visits: Math.max(8, Math.round(sessions * 0.4)) },
    { path: '/servicios', visits: Math.max(4, Math.round(sessions * 0.25)) },
    { path: '/contacto', visits: Math.max(2, Math.round(sessions * 0.15)) }
  ];

  return {
    sessions,
    conversions,
    avgSessionSec: 60 + (numericSeed % 180),
    topPage: topPages[0].path,
    topPageViews: topPages[0].visits,
    topPages,
    raw: { mode: 'dry_run', date, projectId: project.id, domain: project.domain }
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const authHeader = req.headers.get('Authorization');
  const cronSecret = Deno.env.get('CRON_SECRET');

  if (authHeader && authHeader !== `Bearer ${cronSecret}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const supabase = createSupabaseAdminClient();
  const credentialsJson = Deno.env.get('GOOGLE_ANALYTICS_CREDENTIALS') || '';
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];

  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, ga4_property_id, domain, created_by')
    .not('ga4_property_id', 'is', null)
    .not('ga4_property_id', 'eq', '');

  if (projectsError) {
    console.error('Error fetching projects:', projectsError);
    return new Response(JSON.stringify({ error: projectsError.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const results = {
    mode: DRY_RUN ? 'dry_run' : 'live',
    date: dateStr,
    success: 0,
    failed: 0,
    skipped: 0
  };

  for (const project of ((projects || []) as ProjectRow[])) {
    try {
      let ga4Data: Ga4Metrics;

      if (DRY_RUN) {
        ga4Data = buildDryRunMetrics(project, dateStr);
        console.log(`[DRY_RUN] project=${project.id} visits=${ga4Data.sessions} contacts=${ga4Data.conversions}`);
        results.skipped += 1;
        continue;
      }

      if (!credentialsJson) {
        throw new Error('Faltan GOOGLE_ANALYTICS_CREDENTIALS para modo live.');
      }

      ga4Data = await fetchGA4Metrics(project.ga4_property_id, dateStr, credentialsJson);

      const { error: upsertError } = await supabase.from('pulse_metrics').upsert(
        {
          project_id: project.id,
          metric_date: dateStr,
          visits: ga4Data.sessions,
          contacts: ga4Data.conversions,
          top_page: ga4Data.topPage,
          top_page_visits: ga4Data.topPageViews,
          avg_session_sec: ga4Data.avgSessionSec,
          top_pages: ga4Data.topPages,
          raw_ga4_data: ga4Data.raw,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'project_id,metric_date' }
      );

      if (upsertError) {
        throw upsertError;
      }

      if (ga4Data.conversions > 0 && project.created_by) {
        const { data: userPrefs, error: userPrefsError } = await supabase
          .from('users')
          .select('notif_new_consultation')
          .eq('id', project.created_by)
          .maybeSingle();

        if (userPrefsError) {
          throw userPrefsError;
        }

        if ((userPrefs as UserPreferenceRow | null)?.notif_new_consultation !== false) {
          const { data: existingNotification, error: existingNotificationError } = await supabase
            .from('notifications')
            .select('id')
            .eq('user_id', project.created_by)
            .eq('type', 'new_consultation')
            .contains('metadata', { project_id: project.id, date: dateStr })
            .limit(1)
            .maybeSingle();

          if (existingNotificationError) {
            throw existingNotificationError;
          }

          if (!existingNotification?.id) {
            const conversionLabel = `${ga4Data.conversions} consulta${ga4Data.conversions > 1 ? 's' : ''} nueva${ga4Data.conversions > 1 ? 's' : ''}`;
            const { error: notificationError } = await supabase.from('notifications').insert({
              user_id: project.created_by,
              type: 'new_consultation',
              category: 'system',
              title: conversionLabel,
              message: 'Alguien se contactó a través de tu web.',
              is_read: false,
              metadata: {
                project_id: project.id,
                date: dateStr,
                count: ga4Data.conversions
              }
            });

            if (notificationError) {
              throw notificationError;
            }
          }
        }
      }

      results.success += 1;
    } catch (error) {
      console.error(`Error syncing project ${project.id}:`, error);
      results.failed += 1;
    }
  }

  return new Response(JSON.stringify(results), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});
