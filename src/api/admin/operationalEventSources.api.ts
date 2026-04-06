import { supabase } from '@/data/supabase/client';
import type { EventType, OperationalEventSourceType, OperationalEventSeverity, OperationalEventStatus } from '@/api/admin/operationalEvents.api';

export interface OperationalSourceUserRecord {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  onboarding_completed: boolean | null;
  website: string | null;
  website_status: 'missing' | 'pending_review' | 'approved' | 'rejected' | null;
}

export interface OperationalSourceProjectRecord {
  id: string;
  created_by: string | null;
  name: string | null;
  approval_status: 'pending' | 'approved' | 'rejected' | null;
  domain: string | null;
  ga4_property_id: string | null;
  created_at: string;
}

export interface OperationalSourceTicketRecord {
  id: string;
  user_id: string | null;
  status: string | null;
  priority: string | null;
  asunto: string | null;
  created_at: string;
}

export interface OperationalSourcePaymentRecord {
  id: string;
  user_id: string | null;
  status: string | null;
  mercadopago_status: string | null;
  description: string | null;
  created_at: string;
}

export interface ManagedOperationalEventRecord {
  id: string;
  client_id: string;
  type: EventType;
  severity: OperationalEventSeverity;
  status: OperationalEventStatus;
  title: string;
  description: string | null;
  impact: string | null;
  suggested_action: string | null;
  owner_id: string | null;
  source_type: OperationalEventSourceType | null;
  source_id: string | null;
  snoozed_until: string | null;
}

export interface ManagedOperationalEventUpsertInput {
  client_id: string;
  type: EventType;
  severity: OperationalEventSeverity;
  status: OperationalEventStatus;
  title: string;
  description: string | null;
  impact: string | null;
  suggested_action: string | null;
  owner_id: string | null;
  source_type: OperationalEventSourceType | null;
  source_id: string | null;
  snoozed_until?: string | null;
  resolved_at?: string | null;
}

export async function fetchOperationalSourceUsers(): Promise<OperationalSourceUserRecord[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email, role, onboarding_completed, website, website_status')
    .eq('role', 'user');

  if (error) throw error;
  return (data ?? []) as OperationalSourceUserRecord[];
}

export async function fetchOperationalSourceProjects(): Promise<OperationalSourceProjectRecord[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('id, created_by, name, approval_status, domain, ga4_property_id, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as OperationalSourceProjectRecord[];
}

export async function fetchOperationalSourceTickets(): Promise<OperationalSourceTicketRecord[]> {
  const { data, error } = await supabase
    .from('tickets')
    .select('id, user_id, status, priority, asunto, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as OperationalSourceTicketRecord[];
}

export async function fetchOperationalSourcePayments(): Promise<OperationalSourcePaymentRecord[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('id, user_id, status, mercadopago_status, description, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as OperationalSourcePaymentRecord[];
}

export async function fetchManagedOperationalEvents(
  managedTypes: EventType[],
): Promise<ManagedOperationalEventRecord[]> {
  const { data, error } = await supabase
    .from('operational_events')
    .select('id, client_id, type, severity, status, title, description, impact, suggested_action, owner_id, source_type, source_id, snoozed_until')
    .in('type', managedTypes);

  if (error) throw error;
  return (data ?? []) as ManagedOperationalEventRecord[];
}

export async function createManagedOperationalEvent(
  payload: ManagedOperationalEventUpsertInput,
): Promise<void> {
  const { error } = await supabase
    .from('operational_events')
    .upsert(
      {
        ...payload,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        resolved_at: payload.resolved_at ?? null,
        snoozed_until: payload.snoozed_until ?? null,
      },
      {
        onConflict: 'event_key',
        ignoreDuplicates: true,
      },
    );

  if (error) throw error;
}

export async function updateManagedOperationalEvent(
  id: string,
  payload: ManagedOperationalEventUpsertInput,
): Promise<void> {
  const { error } = await supabase
    .from('operational_events')
    .update({
      ...payload,
      updated_at: new Date().toISOString(),
      resolved_at: payload.resolved_at ?? null,
      snoozed_until: payload.snoozed_until ?? null,
    })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteManagedOperationalEvents(ids: string[]): Promise<void> {
  if (ids.length === 0) return;

  const { error } = await supabase.from('operational_events').delete().in('id', ids);

  if (error) throw error;
}
