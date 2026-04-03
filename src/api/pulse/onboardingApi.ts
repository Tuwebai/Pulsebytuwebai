import { supabase } from '@/lib/supabase/supabase';

export interface PulseOnboardingSnapshot {
  id: string;
  full_name: string | null;
  onboarding_completed: boolean | null;
  onboarding_completed_at: string | null;
  website: string | null;
  website_status: 'missing' | 'pending_review' | 'approved' | 'rejected' | null;
  website_submitted_at: string | null;
  website_reviewed_at: string | null;
  website_reviewed_by: string | null;
  website_review_notes: string | null;
}

export interface UserProjectDomainRecord {
  id: string;
  domain: string | null;
  ga4_property_id: string | null;
}

export const onboardingApi = {
  async getUserSnapshot(userId: string): Promise<PulseOnboardingSnapshot | null> {
    const { data, error } = await supabase
      .from('users')
      .select(
        'id, full_name, onboarding_completed, onboarding_completed_at, website, website_status, website_submitted_at, website_reviewed_at, website_reviewed_by, website_review_notes'
      )
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  },

  async getLatestProject(userId: string): Promise<UserProjectDomainRecord | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('id, domain, ga4_property_id')
      .eq('created_by', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  },

  async saveDomainSubmission(userId: string, domain: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({
        website: domain,
        website_status: 'pending_review',
        website_submitted_at: new Date().toISOString(),
        website_reviewed_at: null,
        website_reviewed_by: null,
        website_review_notes: null,
      })
      .eq('id', userId);

    if (error) {
      throw error;
    }
  },

  async completeOnboarding(userId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      throw error;
    }
  }
};
