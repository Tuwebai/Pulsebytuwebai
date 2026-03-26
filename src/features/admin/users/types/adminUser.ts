import type { AdminUserRecord } from '@/api/admin/adminDashboard.api';

export interface AdminManagedUser extends AdminUserRecord {
  avatar_url?: string | null;
  website?: string | null;
  website_status?: string | null;
  website_submitted_at?: string | null;
  website_reviewed_at?: string | null;
  website_reviewed_by?: string | null;
  website_review_notes?: string | null;
  updated_at?: string | null;
}

export interface AdminUserFormData {
  email: string;
  full_name: string;
  role: string;
}
