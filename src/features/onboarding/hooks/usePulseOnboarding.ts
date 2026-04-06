import { useCallback, useEffect, useState } from 'react';
import { useApp } from '@/contexts/useApp';
import { onboardingService } from '@/services/pulse/onboardingService';

interface PulseOnboardingState {
  loading: boolean;
  submitting: boolean;
  domain: string;
  fullName: string;
  completed: boolean;
  websiteStatus: 'missing' | 'pending_review' | 'approved' | 'rejected';
  refresh: () => Promise<void>;
  saveDomain: (domain: string) => Promise<{ saved: boolean; normalizedDomain: string }>;
  complete: () => Promise<void>;
}

export function usePulseOnboarding(): PulseOnboardingState {
  const { user, refreshData, updateUserSettings } = useApp();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [domain, setDomain] = useState('');
  const [fullName, setFullName] = useState('');
  const [completed, setCompleted] = useState(Boolean(user?.onboarding_completed));
  const [websiteStatus, setWebsiteStatus] = useState<'missing' | 'pending_review' | 'approved' | 'rejected'>('missing');

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const state = await onboardingService.getState(user.id);
      setDomain(state.domain);
      setFullName(state.user?.full_name || user.full_name || '');
      setCompleted(Boolean(state.user?.onboarding_completed));
      setWebsiteStatus(state.user?.website_status ?? (state.domain ? 'pending_review' : 'missing'));
    } finally {
      setLoading(false);
    }
  }, [user?.full_name, user?.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveDomain = useCallback(async (value: string) => {
    if (!user?.id) {
      return { saved: false, normalizedDomain: '' };
    }

    setSubmitting(true);

    try {
      const result = await onboardingService.saveDomain(user.id, value);

      if (result.saved) {
        setDomain(result.normalizedDomain);
        setWebsiteStatus('pending_review');
        await updateUserSettings({
          website: result.normalizedDomain,
          website_status: 'pending_review',
          website_submitted_at: new Date().toISOString(),
          website_reviewed_at: null,
          website_reviewed_by: null,
          website_review_notes: null,
        });
        await refreshData();
      }

      return result;
    } finally {
      setSubmitting(false);
    }
  }, [refreshData, updateUserSettings, user?.id]);

  const complete = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    setSubmitting(true);

    try {
      const completedAt = new Date().toISOString();
      await onboardingService.complete(user.id);
      setCompleted(true);
      await updateUserSettings({
        onboarding_completed: true,
        onboarding_completed_at: completedAt,
      });
      await refreshData();
    } finally {
      setSubmitting(false);
    }
  }, [refreshData, updateUserSettings, user?.id]);

  return { loading, submitting, domain, fullName, completed, websiteStatus, refresh, saveDomain, complete };
}
