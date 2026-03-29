import type { AdminUserRecord } from '@/api/admin/adminDashboard.api';
import type { WebsiteReviewStatus } from '@/features/admin/services/pulseDomainAdminService';

export interface AdminManagedUser extends AdminUserRecord {
  avatar_url?: string | null;
  website?: string | null;
  website_status?: WebsiteReviewStatus | null;
  website_submitted_at?: string | null;
  website_reviewed_at?: string | null;
  website_reviewed_by?: string | null;
  website_review_notes?: string | null;
  pulse_access_status?: 'pending' | 'invited' | 'active' | 'disabled' | null;
  pulse_access_granted_at?: string | null;
  pulse_access_granted_by?: string | null;
  pulse_access_disabled_at?: string | null;
  account_deletion_request_id?: string | null;
  account_deletion_requested_at?: string | null;
  account_deletion_reason?: string | null;
  updated_at?: string | null;
}

export interface AdminUserFormData {
  email: string;
  full_name: string;
  role: string;
}
