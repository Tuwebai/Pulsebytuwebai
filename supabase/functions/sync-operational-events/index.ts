// @ts-expect-error - Deno runtime
/// <reference lib="deno.window" />
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import {
  buildEventKey,
  buildLatestProjectMap,
  corsHeaders,
  ensureAuthenticatedAdmin,
  jsonResponse,
  type ManagedEventInput,
  type ManagedEventRecord,
} from './shared.ts';
import { createProjectApprovalEvents, createUserEvents } from './userProjectBuilders.ts';
import { createPaymentEvents, createTicketEvents } from './ticketPaymentBuilders.ts';

const MANAGED_EVENT_TYPES = [
  'payment_pending',
  'payment_rejected',
  'payment_overdue',
  'ticket_critical',
  'ticket_sla_breach',
  'domain_not_connected',
  'ga4_not_connected',
  'client_no_pulse_data',
  'project_approval_pending',
  'onboarding_incomplete',
];

async function applyEvents(adminClient: Awaited<ReturnType<typeof ensureAuthenticatedAdmin>>, desiredEvents: ManagedEventInput[], existingEvents: ManagedEventRecord[]) {
  const existingByKey = new Map(existingEvents.map((event) => [buildEventKey(event), event]));
  const desiredByKey = new Map(desiredEvents.map((event) => [buildEventKey(event), event]));
  let created = 0;
  let updated = 0;

  for (const [key, desiredEvent] of desiredByKey) {
    const existingEvent = existingByKey.get(key);

    if (!existingEvent) {
      const { error } = await adminClient.from('operational_events').upsert(
        {
          ...desiredEvent,
          updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          resolved_at: desiredEvent.resolved_at ?? null,
          snoozed_until: desiredEvent.snoozed_until ?? null,
        },
        { onConflict: 'event_key', ignoreDuplicates: true },
      );
      if (error) throw error;
      created += 1;
      continue;
    }

    const { error } = await adminClient.from('operational_events').update({
      ...desiredEvent,
      owner_id: existingEvent.owner_id ?? desiredEvent.owner_id,
      snoozed_until: existingEvent.status === 'snoozed' ? existingEvent.snoozed_until : null,
      resolved_at: desiredEvent.status === 'resolved' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }).eq('id', existingEvent.id);
    if (error) throw error;
    updated += 1;
  }

  const staleIds = existingEvents
    .filter((event) => !desiredByKey.has(buildEventKey(event)))
    .map((event) => event.id);

  if (staleIds.length > 0) {
    const { error } = await adminClient.from('operational_events').delete().in('id', staleIds);
    if (error) throw error;
  }

  return { created, updated, deleted: staleIds.length };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse(405, { error: 'Method Not Allowed' });

  const authorization = req.headers.get('Authorization');
  if (!authorization) return jsonResponse(401, { error: 'Unauthorized' });

  try {
    const adminClient = await ensureAuthenticatedAdmin(authorization);
    const [users, projects, tickets, payments, existingEventsResult] = await Promise.all([
      adminClient.from('users').select('id, role, onboarding_completed, website, website_status').eq('role', 'user'),
      adminClient.from('projects').select('id, created_by, name, approval_status, domain, ga4_property_id, created_at').order('created_at', { ascending: false }),
      adminClient.from('tickets').select('id, user_id, status, priority, asunto, created_at').order('created_at', { ascending: false }),
      adminClient.from('payments').select('id, user_id, status, mercadopago_status, description, created_at').order('created_at', { ascending: false }),
      adminClient.from('operational_events').select('id, client_id, type, status, owner_id, source_type, source_id, snoozed_until, updated_at, created_at').in('type', MANAGED_EVENT_TYPES),
    ]);

    if (users.error) throw users.error;
    if (projects.error) throw projects.error;
    if (tickets.error) throw tickets.error;
    if (payments.error) throw payments.error;
    if (existingEventsResult.error) throw existingEventsResult.error;

    const existingEvents = (existingEventsResult.data ?? []) as ManagedEventRecord[];
    const existingByKey = new Map(existingEvents.map((event) => [buildEventKey(event), event]));
    const latestProjectByUser = buildLatestProjectMap(projects.data ?? []);
    const desiredEvents = [
      ...createUserEvents(users.data ?? [], latestProjectByUser, existingByKey),
      ...createProjectApprovalEvents(projects.data ?? [], existingByKey),
      ...createTicketEvents(tickets.data ?? [], existingByKey),
      ...createPaymentEvents(payments.data ?? [], existingByKey),
    ];

    const summary = await applyEvents(adminClient, desiredEvents, existingEvents);
    return jsonResponse(200, { ok: true, ...summary, desired: desiredEvents.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') return jsonResponse(401, { error: message });
    if (message === 'FORBIDDEN') return jsonResponse(403, { error: message });
    console.error('Error en sync-operational-events:', message);
    return jsonResponse(500, { error: 'Unable to sync operational events' });
  }
});
