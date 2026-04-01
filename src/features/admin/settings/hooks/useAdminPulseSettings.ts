import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PulseExperienceSettings } from '@/data/types/pulse';
import { useApp } from '@/contexts/AppContext';
import { DEFAULT_PULSE_EXPERIENCE_SETTINGS } from '@/api/pulseAdminSettings.api';
import {
  getAdminPulseSettings,
  updateAdminPulseSettings,
} from '@/features/admin/settings/services/adminPulseSettings.service';

export function useAdminPulseSettings() {
  const queryClient = useQueryClient();
  const { user } = useApp();
  const [draft, setDraft] = useState<PulseExperienceSettings | null>(null);

  const query = useQuery<PulseExperienceSettings>({
    queryKey: ['pulse-experience-settings'],
    queryFn: getAdminPulseSettings,
  });

  const settings = draft ?? query.data ?? DEFAULT_PULSE_EXPERIENCE_SETTINGS;

  const mutation = useMutation({
    mutationFn: async (nextSettings: PulseExperienceSettings) => {
      if (!user?.id) {
        throw new Error('No pudimos identificar al administrador para guardar estos ajustes.');
      }

      return updateAdminPulseSettings(nextSettings, user.id);
    },
    onSuccess: (savedSettings) => {
      setDraft(savedSettings);
      queryClient.setQueryData(['pulse-experience-settings'], savedSettings);
    },
  });

  const hasUnsavedChanges = useMemo(() => {
    const base = query.data ?? DEFAULT_PULSE_EXPERIENCE_SETTINGS;
    return JSON.stringify(settings) !== JSON.stringify(base);
  }, [query.data, settings]);

  const updateSetting = <Key extends keyof PulseExperienceSettings>(
    key: Key,
    value: PulseExperienceSettings[Key],
  ) => {
    setDraft((current) => ({
      ...(current ?? query.data ?? DEFAULT_PULSE_EXPERIENCE_SETTINGS),
      [key]: value,
    }));
  };

  return {
    hasUnsavedChanges,
    isLoading: query.isLoading,
    isSaving: mutation.isPending,
    resetToSaved: () => setDraft(query.data ?? DEFAULT_PULSE_EXPERIENCE_SETTINGS),
    restoreDefaults: () => setDraft(DEFAULT_PULSE_EXPERIENCE_SETTINGS),
    saveSettings: async () => mutation.mutateAsync(settings),
    settings,
    updateSetting,
  };
}
