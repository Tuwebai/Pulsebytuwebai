import { supabase } from '@/lib/supabase/supabase';

export type EventType =
  | 'payment_pending'
  | 'payment_rejected'
  | 'payment_overdue'
  | 'ticket_critical'
  | 'ticket_sla_breach'
  | 'domain_not_connected'
  | 'ga4_not_connected'
  | 'client_no_pulse_data'
  | 'project_approval_pending'
  | 'onboarding_incomplete'
  | 'metrics_drop'
  | 'system_alert';

export type OperationalEventSeverity = 'critical' | 'high' | 'medium' | 'low';
export type OperationalEventStatus = 'open' | 'in_progress' | 'snoozed' | 'resolved';
export type OperationalEventSourceType =
  | 'payment'
  | 'ticket'
  | 'project'
  | 'onboarding'
  | 'domain'
  | 'system';

export interface OperationalEvent {
  id: string;
  client_id: string;
  client_name: string;
  client_email: string;
  type: EventType;
  severity: OperationalEventSeverity;
  status: OperationalEventStatus;
  title: string;
  description: string | null;
  impact: string | null;
  suggested_action: string | null;
  owner_id: string | null;
  owner_name: string | null;
  source_type: OperationalEventSourceType | null;
  source_id: string | null;
  snoozed_until: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventFilters {
  status?: OperationalEventStatus[];
  severity?: OperationalEventSeverity[];
  source_type?: OperationalEventSourceType[];
  owner_id?: string | 'unassigned';
  search?: string;
}

export interface EventCounts {
  open_total: number;
  critical_open: number;
  unassigned: number;
  in_progress: number;
  resolved_today: number;
}

export interface OperationalEventAdminRecord {
  id: string;
  full_name: string | null;
  email: string | null;
}

interface OperationalEventRecord {
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
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

interface OperationalEventUserRecord {
  id: string;
  full_name: string | null;
  email: string | null;
}

const SEVERITY_ORDER: Record<OperationalEventSeverity, number> = {
  critical: 1,
  high: 2,
  medium: 3,
  low: 4,
};

async function fetchRelatedUsers(userIds: string[]): Promise<OperationalEventUserRecord[]> {
  if (userIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email')
    .in('id', userIds);

  if (error) {
    throw error;
  }

  return (data ?? []) as OperationalEventUserRecord[];
}

function buildUserMap(users: OperationalEventUserRecord[]) {
  return new Map(users.map((user) => [user.id, user]));
}

function sortEvents(events: OperationalEvent[]) {
  return [...events].sort((left, right) => {
    const severityDelta = SEVERITY_ORDER[left.severity] - SEVERITY_ORDER[right.severity];

    if (severityDelta !== 0) {
      return severityDelta;
    }

    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
  });
}

function matchesSearch(event: OperationalEvent, search: string) {
  const normalizedSearch = search.trim().toLowerCase();

  if (!normalizedSearch) {
    return true;
  }

  const haystack = [
    event.title,
    event.description ?? '',
    event.client_name,
    event.client_email,
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(normalizedSearch);
}

function isNonEmptyString(value: string | null): value is string {
  return Boolean(value);
}

export async function fetchEvents(filters: EventFilters = {}): Promise<OperationalEvent[]> {
  let query = supabase.from('operational_events').select('*');

  if (filters.status?.length) {
    query = query.in('status', filters.status);
  }

  if (filters.severity?.length) {
    query = query.in('severity', filters.severity);
  }

  if (filters.source_type?.length) {
    query = query.in('source_type', filters.source_type);
  }

  if (filters.owner_id === 'unassigned') {
    query = query.is('owner_id', null);
  } else if (filters.owner_id) {
    query = query.eq('owner_id', filters.owner_id);
  }

  const { data, error } = await query.order('created_at', { ascending: false }).limit(100);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as OperationalEventRecord[];
  const relatedUserIds = [
    ...new Set(rows.flatMap((row) => [row.client_id, row.owner_id]).filter(isNonEmptyString)),
  ];
  const relatedUsers = await fetchRelatedUsers(relatedUserIds);
  const usersMap = buildUserMap(relatedUsers);

  const events = rows.map<OperationalEvent>((row) => {
    const client = usersMap.get(row.client_id);
    const owner = row.owner_id ? usersMap.get(row.owner_id) : undefined;

    return {
      ...row,
      client_name: client?.full_name ?? 'Cliente sin nombre',
      client_email: client?.email ?? '',
      owner_name: owner?.full_name ?? owner?.email ?? null,
    };
  });

  return sortEvents(events)
    .filter((event) => matchesSearch(event, filters.search ?? ''))
    .slice(0, 50);
}

export async function fetchEventCounts(): Promise<EventCounts> {
  const { data, error } = await supabase
    .from('operational_events')
    .select('status, severity, owner_id, resolved_at');

  if (error) {
    throw error;
  }

  const last24Hours = Date.now() - 24 * 60 * 60 * 1000;
  const rows = (data ?? []) as Pick<
    OperationalEventRecord,
    'status' | 'severity' | 'owner_id' | 'resolved_at'
  >[];

  return rows.reduce<EventCounts>(
    (counts, row) => {
      if (row.status === 'open') {
        counts.open_total += 1;
        if (row.severity === 'critical') counts.critical_open += 1;
        if (!row.owner_id) counts.unassigned += 1;
      }
      if (row.status === 'in_progress') counts.in_progress += 1;
      if (row.resolved_at && new Date(row.resolved_at).getTime() >= last24Hours) {
        counts.resolved_today += 1;
      }
      return counts;
    },
    { open_total: 0, critical_open: 0, unassigned: 0, in_progress: 0, resolved_today: 0 },
  );
}

export async function fetchOperationalEventAdmins(): Promise<OperationalEventAdminRecord[]> {
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email')
    .eq('role', 'admin')
    .order('full_name', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as OperationalEventAdminRecord[];
}

export async function updateEventStatus(
  id: string,
  status: OperationalEventStatus,
  resolvedAt?: string | null,
): Promise<void> {
  const { error } = await supabase
    .from('operational_events')
    .update({ status, resolved_at: resolvedAt ?? null, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw error;
  }
}

export async function assignEvent(id: string, ownerId: string | null): Promise<void> {
  const { error } = await supabase
    .from('operational_events')
    .update({ owner_id: ownerId, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    throw error;
  }
}

export async function snoozeEvent(id: string, until: Date): Promise<void> {
  const { error } = await supabase
    .from('operational_events')
    .update({
      status: 'snoozed',
      snoozed_until: until.toISOString(),
      resolved_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    throw error;
  }
}

export async function resolveEvent(id: string): Promise<void> {
  await updateEventStatus(id, 'resolved', new Date().toISOString());
}
