import { supabase } from '@/lib/supabase';

export interface AdminUserRecord {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
  created_at: string;
  [key: string]: unknown;
}

export interface AdminProjectRecord {
  id: string;
  user_id: string | null;
  status: string | null;
  created_at: string;
  [key: string]: unknown;
}

export interface AdminPaymentRecord {
  id: string;
  amount: number | string | null;
  description: string | null;
  status: string | null;
  created_at: string;
  [key: string]: unknown;
}

export interface AdminRawTicketRecord {
  id: string;
  title: string | null;
  description: string | null;
  priority: number | string | null;
  urgency: string | null;
  status: string | null;
  category: string | null;
  tags: string[] | null;
  created_at: string;
  user_id: string | null;
}

export interface AdminTicketUserRecord {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
}

export async function fetchAdminUsers(): Promise<AdminUserRecord[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as AdminUserRecord[];
}

export async function fetchAdminProjects(): Promise<AdminProjectRecord[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as AdminProjectRecord[];
}

export async function fetchAdminTickets(): Promise<AdminRawTicketRecord[]> {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as AdminRawTicketRecord[];
}

export async function fetchAdminPayments(): Promise<AdminPaymentRecord[]> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as AdminPaymentRecord[];
}

export async function fetchAdminTicketUsers(
  userIds: string[],
): Promise<AdminTicketUserRecord[]> {
  if (userIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, email, role')
    .in('id', userIds);

  if (error) {
    throw error;
  }

  return (data ?? []) as AdminTicketUserRecord[];
}
