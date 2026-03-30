// @ts-expect-error - Deno runtime
/// <reference lib="deno.window" />
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { buildDryRunMetrics, fetchGa4Metrics, getGoogleAccessToken } from './ga4.ts';
import { insertConsultationNotification } from './notifications.ts';
import { buildDateWindow, createSupabaseAdminClient, resolveRequestContext } from './request.ts';
import { DRY_RUN, SyncGa4MetricsError, corsHeaders, jsonResponse, type ProjectRow } from './types.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  try {
    const requestContext = await resolveRequestContext(req);
    const supabase = createSupabaseAdminClient();
    const dates = buildDateWindow(requestContext.days, requestContext.includeToday);
    const credentialsJson = Deno.env.get('GOOGLE_ANALYTICS_CREDENTIALS') || '';

    const baseQuery = supabase
      .from('projects')
      .select('id, ga4_property_id, domain, created_by')
      .not('ga4_property_id', 'is', null)
      .not('ga4_property_id', 'eq', '');

    const projectsQuery = requestContext.projectId ? baseQuery.eq('id', requestContext.projectId) : baseQuery;
    const { data: projects, error: projectsError } = await projectsQuery;

    if (projectsError) {
      console.error('[sync-ga4-metrics] projects', projectsError);
      return jsonResponse(500, { error: projectsError.message });
    }

    const typedProjects = (projects || []) as ProjectRow[];

    if (requestContext.projectId && typedProjects.length === 0) {
      return jsonResponse(404, {
        error: 'PROJECT_NOT_READY',
        message: 'Todavia no encontramos una propiedad de GA4 activa para este proyecto.',
      });
    }

    const accessToken = DRY_RUN
      ? null
      : credentialsJson
        ? await getGoogleAccessToken(credentialsJson)
        : (() => {
            throw new SyncGa4MetricsError(
              500,
              'Falta configurar la conexion real con Google Analytics.',
              'GA4_CREDENTIALS_MISSING',
            );
          })();

    const results = {
      mode: DRY_RUN ? 'dry_run' : requestContext.mode,
      dates,
      projects: typedProjects.length,
      success: 0,
      failed: 0,
      skipped: 0,
      rows_upserted: 0,
    };

    for (const project of typedProjects) {
      for (const dateStr of dates) {
        try {
          const ga4Data = DRY_RUN
            ? buildDryRunMetrics(project, dateStr)
            : await fetchGa4Metrics(project.ga4_property_id, dateStr, accessToken);

          if (DRY_RUN) {
            console.log(`[DRY_RUN] project=${project.id} date=${dateStr} visits=${ga4Data.sessions} contacts=${ga4Data.conversions}`);
            results.skipped += 1;
            continue;
          }

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
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'project_id,metric_date' },
          );

          if (upsertError) {
            throw upsertError;
          }

          if (requestContext.canNotify) {
            await insertConsultationNotification({
              supabase,
              project,
              date: dateStr,
              conversions: ga4Data.conversions,
            });
          }

          results.success += 1;
          results.rows_upserted += 1;
        } catch (error) {
          console.error(`[sync-ga4-metrics] project=${project.id} date=${dateStr}`, error);
          results.failed += 1;
        }
      }
    }

    return jsonResponse(200, results);
  } catch (error) {
    if (error instanceof SyncGa4MetricsError) {
      return jsonResponse(error.status, { error: error.code, message: error.publicMessage });
    }

    console.error('[sync-ga4-metrics]', error);
    return jsonResponse(500, {
      error: 'SYNC_GA4_METRICS_FAILED',
      message: 'No pudimos completar la sincronizacion de metricas.',
    });
  }
});
