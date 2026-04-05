// @ts-expect-error - Deno runtime
/// <reference lib="deno.window" />
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders, jsonResponse, SyncSearchConsoleError } from './types.ts';
import { resolveRequestContext } from './request.ts';
import { runSearchConsoleSync } from './runSync.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'METHOD_NOT_ALLOWED', message: 'Method Not Allowed' });
  }

  try {
    const requestContext = await resolveRequestContext(req);
    const summary = await runSearchConsoleSync(requestContext.projectId, requestContext.syncDays);

    return jsonResponse(200, summary);
  } catch (error) {
    const syncError =
      error instanceof SyncSearchConsoleError
        ? error
        : new SyncSearchConsoleError(500, 'No pudimos sincronizar las métricas de Google.', 'SYNC_SEARCH_CONSOLE_FAILED');

    if (!(error instanceof SyncSearchConsoleError)) {
      console.error('[sync-search-console-metrics]', error);
    }

    return jsonResponse(syncError.status, {
      error: syncError.code,
      message: syncError.publicMessage,
    });
  }
});
