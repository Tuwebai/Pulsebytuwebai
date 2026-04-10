// @ts-expect-error - Deno runtime
/// <reference lib="deno.window" />
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
// @ts-expect-error - Deno import for Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { generateMonthlyEmailHtml, generateMonthlyEmailSubject, type MonthlyEmailPayload } from './template.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-pulse-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const DRY_RUN = Deno.env.get('EMAIL_DRY_RUN') === 'true';

interface UserRow {
  id: string;
  full_name: string | null;
  onboarding_completed: boolean | null;
  notif_monthly_summary: boolean | null;
}

interface ProjectRow {
  id: string;
  domain: string | null;
}

interface MetricRow {
  visits: number | null;
  contacts: number | null;
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

function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function sumMetrics(rows: MetricRow[] | null): { visits: number; contacts: number } {
  return (rows || []).reduce(
    (totals, row) => ({
      visits: totals.visits + (row.visits || 0),
      contacts: totals.contacts + (row.contacts || 0)
    }),
    { visits: 0, contacts: 0 }
  );
}

function calcDelta(current: number, previous: number): number | null {
  if (previous <= 0) {
    return null;
  }

  return Math.round(((current - previous) / previous) * 100);
}

async function sendMonthlyEmail(payload: MonthlyEmailPayload): Promise<void> {
  const zeptoMailToken = Deno.env.get('ZEPTOMAIL_SEND_MAIL_TOKEN');
  const zeptoMailApiUrl =
    Deno.env.get('ZEPTOMAIL_API_URL') || 'https://api.zeptomail.com/v1.1/email';
  const from = Deno.env.get('SMTP_FROM') || 'pulse@tuweb-ai.com';
  const replyTo = Deno.env.get('EMAIL_REPLY_TO') || 'pulse@tuweb-ai.com';
  const fromName = Deno.env.get('EMAIL_FROM_NAME') || 'Pulse by TuWebAI';

  if (!zeptoMailToken) {
    throw new Error('Falta ZEPTOMAIL_SEND_MAIL_TOKEN para enviar el resumen mensual.');
  }

  const response = await fetch(zeptoMailApiUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Zoho-enczapikey ${zeptoMailToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: {
        address: from,
        name: fromName
      },
      to: [
        {
          email_address: {
            address: payload.to,
            name: payload.name
          }
        }
      ],
      reply_to: [
        {
          address: replyTo,
          name: fromName
        }
      ],
      subject: generateMonthlyEmailSubject(payload),
      htmlbody: generateMonthlyEmailHtml(payload),
      track_clicks: false,
      track_opens: false,
      client_reference: `monthly-summary:${payload.to}:${payload.monthName}`
    })
  });

  if (!response.ok) {
    throw new Error(`ZeptoMail devolvió ${response.status}: ${await response.text()}`);
  }
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
  const headerCronSecret = req.headers.get('x-pulse-cron-secret');
  const cronSecret = Deno.env.get('CRON_SECRET');
  const isAuthorizedCronRequest =
    Boolean(cronSecret) &&
    ((authHeader && authHeader === `Bearer ${cronSecret}`) || (headerCronSecret && headerCronSecret === cronSecret));

  if (!isAuthorizedCronRequest) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const supabase = createSupabaseAdminClient();
  const now = new Date();
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(lastMonthStart.getTime() - 1);
  const previousMonthStart = new Date(previousMonthEnd.getFullYear(), previousMonthEnd.getMonth(), 1);

  const fromDate = toDateString(lastMonthStart);
  const toDate = toDateString(lastMonthEnd);
  const previousFromDate = toDateString(previousMonthStart);
  const previousToDate = toDateString(previousMonthEnd);
  const monthName = lastMonthStart.toLocaleDateString('es-AR', {
    month: 'long',
    year: 'numeric'
  });

  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, full_name, onboarding_completed, notif_monthly_summary')
    .eq('onboarding_completed', true)
    .eq('notif_monthly_summary', true);

  if (usersError) {
    console.error('Error fetching users:', usersError);
    return new Response(JSON.stringify({ error: usersError.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const results = {
    mode: DRY_RUN ? 'dry_run' : 'live',
    month: monthName,
    sent: 0,
    skipped: 0,
    failed: 0
  };

  for (const user of ((users || []) as UserRow[])) {
    try {
      const { data: authUser, error: authUserError } = await supabase.auth.admin.getUserById(user.id);
      if (authUserError) {
        throw authUserError;
      }

      const email = authUser.user?.email;
      if (!email) {
        results.skipped += 1;
        continue;
      }

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id, domain')
        .eq('created_by', user.id)
        .limit(1)
        .maybeSingle();

      if (projectError) {
        throw projectError;
      }

      if (!(project as ProjectRow | null)?.id) {
        results.skipped += 1;
        continue;
      }

      const { data: metrics, error: metricsError } = await supabase
        .from('pulse_metrics')
        .select('visits, contacts')
        .eq('project_id', project.id)
        .gte('metric_date', fromDate)
        .lte('metric_date', toDate);

      if (metricsError) {
        throw metricsError;
      }

      if (!metrics || metrics.length === 0) {
        results.skipped += 1;
        continue;
      }

      const current = sumMetrics(metrics as MetricRow[]);

      const { data: previousMetrics, error: previousMetricsError } = await supabase
        .from('pulse_metrics')
        .select('visits, contacts')
        .eq('project_id', project.id)
        .gte('metric_date', previousFromDate)
        .lte('metric_date', previousToDate);

      if (previousMetricsError) {
        throw previousMetricsError;
      }

      const previous = sumMetrics(previousMetrics as MetricRow[] | null);
      const payload: MonthlyEmailPayload = {
        to: email,
        name: user.full_name || 'cliente',
        monthName,
        visits: current.visits,
        contacts: current.contacts,
        deltaVisits: calcDelta(current.visits, previous.visits),
        domain: project.domain
      };

      if (DRY_RUN) {
        console.log(
          `[DRY_RUN] ${email}: visits=${payload.visits} contacts=${payload.contacts} delta=${payload.deltaVisits ?? 'n/a'}`
        );
        results.skipped += 1;
        continue;
      }

      await sendMonthlyEmail(payload);

      const { error: notificationError } = await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'success',
        category: 'system',
        title: `Tu resumen de ${monthName} está listo`,
        message: `Tu web tuvo ${current.visits} visitas y ${current.contacts} consultas.`,
        is_read: false,
        metadata: {
          month: fromDate,
          visits: current.visits,
          contacts: current.contacts
        }
      });

      if (notificationError) {
        throw notificationError;
      }

      results.sent += 1;
    } catch (error) {
      console.error(`Error processing monthly email for user ${user.id}:`, error);
      results.failed += 1;
    }
  }

  return new Response(JSON.stringify(results), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});
