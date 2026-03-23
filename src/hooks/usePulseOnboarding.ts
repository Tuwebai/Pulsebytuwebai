import { useCallback, useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { onboardingService } from '@/services/pulse/onboardingService';

interface PulseOnboardingState {
  loading: boolean;
  submitting: boolean;
  domain: string;
  fullName: string;
  completed: boolean;
  refresh: () => Promise<void>;
  saveDomain: (domain: string) => Promise<{ saved: boolean; normalizedDomain: string }>;
  complete: () => Promise<void>;
}

export function usePulseOnboarding(): PulseOnboardingState {
  const { user, refreshData } = useApp();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [domain, setDomain] = useState('');
  const [fullName, setFullName] = useState('');
  const [completed, setCompleted] = useState(Boolean(user?.onboarding_completed));

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
    } finally {
      setLoading(false);
    }
  }, [user?.full_name, user?.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const saveDomain = useCallback(
    async (value: string) => {
      if (!user?.id) {
        return { saved: false, normalizedDomain: '' };
      }

      setSubmitting(true);

      try {
        const result = await onboardingService.saveDomain(user.id, value);
        if (result.saved) {
          setDomain(result.normalizedDomain);
          await refreshData();
        }
        return result;
      } finally {
        setSubmitting(false);
      }
    },
    [refreshData, user?.id]
  );

  const complete = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    setSubmitting(true);

    try {
      await onboardingService.complete(user.id);
      setCompleted(true);
      await refreshData();
    } finally {
      setSubmitting(false);
    }
  }, [refreshData, user?.id]);

  return {
    loading,
    submitting,
    domain,
    fullName,
    completed,
    refresh,
    saveDomain,
    complete
  };
}
