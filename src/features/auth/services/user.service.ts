import { supabase } from '@/lib/supabase/supabase';

export interface UserRecord {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  onboarding_completed?: boolean;
  onboarding_completed_at?: string | null;
  website?: string | null;
  website_status?: 'missing' | 'pending_review' | 'approved' | 'rejected' | null;
  website_submitted_at?: string | null;
  website_reviewed_at?: string | null;
  website_reviewed_by?: string | null;
  website_review_notes?: string | null;
  pulse_access_status?: 'pending' | 'invited' | 'active' | 'disabled';
  pulse_access_granted_at?: string | null;
  pulse_access_granted_by?: string | null;
  pulse_access_disabled_at?: string | null;
}

const USER_SELECT = [
  'id',
  'email',
  'full_name',
  'role',
  'created_at',
  'updated_at',
  'avatar_url',
  'onboarding_completed',
  'onboarding_completed_at',
  'website',
  'website_status',
  'website_submitted_at',
  'website_reviewed_at',
  'website_reviewed_by',
  'website_review_notes',
  'pulse_access_status',
  'pulse_access_granted_at',
  'pulse_access_granted_by',
  'pulse_access_disabled_at',
  'animations_enabled',
  'low_bandwidth_mode',
  'two_factor_auth',
  'session_timeout',
  'login_notifications',
  'device_management',
  'notif_new_consultation',
  'notif_monthly_summary',
  'notif_project_update',
].join(', ');

function buildUserPayload(userData: Partial<UserRecord>) {
  return {
    ...userData,
    role: userData.role ?? 'user',
    pulse_access_status:
      userData.role === 'admin'
        ? userData.pulse_access_status
        : (userData.pulse_access_status ?? 'pending'),
    updated_at: userData.updated_at ?? new Date().toISOString(),
  };
}

export const userService = {
  async getUserById(id: string): Promise<UserRecord | null> {
    if (!id || id.trim() === '') {
      return null;
    }

    const { data, error } = await supabase.from('users').select(USER_SELECT).eq('id', id).maybeSingle();

    if (error) {
      if (error.message?.includes('Failed to fetch') || error.message?.includes('ERR_CONNECTION_CLOSED')) {
        return null;
      }

      throw error;
    }

    return data as UserRecord | null;
  },

  async updateUser(id: string, updates: Partial<UserRecord>): Promise<void> {
    const { error } = await supabase.from('users').update(updates).eq('id', id);
    if (error) throw error;
  },

  async upsertUser(userData: UserRecord): Promise<void> {
    const { error } = await supabase.from('users').upsert(buildUserPayload(userData), { onConflict: 'id' });
    if (error) throw error;
  },

  async createUser(userData: Omit<UserRecord, 'id'>): Promise<UserRecord> {
    const { data, error } = await supabase.from('users').insert([buildUserPayload(userData)]).select().single();
    if (error) throw error;
    return data as UserRecord;
  },
};
