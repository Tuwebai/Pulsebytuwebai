import { useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'pulse_admin_settings_preferences_v1';

export interface AdminSettingsPreferences {
  productLabel: string;
  locale: 'es-AR' | 'en-US';
  timezone: 'America/Argentina/Buenos_Aires' | 'UTC' | 'America/New_York';
  autoRefresh: boolean;
  compactDensity: boolean;
  urgentSignalsFirst: boolean;
  confirmationsEnabled: boolean;
  financialSummaryVisible: boolean;
  realtimeBadgesEnabled: boolean;
}

const DEFAULT_PREFERENCES: AdminSettingsPreferences = {
  productLabel: 'Pulse by TuWebAI',
  locale: 'es-AR',
  timezone: 'America/Argentina/Buenos_Aires',
  autoRefresh: true,
  compactDensity: true,
  urgentSignalsFirst: true,
  confirmationsEnabled: true,
  financialSummaryVisible: true,
  realtimeBadgesEnabled: true,
};

function readStoredPreferences(): AdminSettingsPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES;
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return DEFAULT_PREFERENCES;
    }

    const parsedValue = JSON.parse(rawValue) as Partial<AdminSettingsPreferences>;
    return { ...DEFAULT_PREFERENCES, ...parsedValue };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function useAdminSettingsPreferences() {
  const [savedPreferences, setSavedPreferences] = useState<AdminSettingsPreferences>(DEFAULT_PREFERENCES);
  const [preferences, setPreferences] = useState<AdminSettingsPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const storedPreferences = readStoredPreferences();
    setSavedPreferences(storedPreferences);
    setPreferences(storedPreferences);
  }, []);

  const updatePreference = <Key extends keyof AdminSettingsPreferences>(
    key: Key,
    value: AdminSettingsPreferences[Key],
  ) => {
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  const resetToSaved = () => {
    setPreferences(savedPreferences);
  };

  const restoreDefaults = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

  const savePreferences = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    }

    setSavedPreferences(preferences);
  };

  const summary = useMemo(() => {
    const liveSignals = [
      preferences.autoRefresh,
      preferences.urgentSignalsFirst,
      preferences.realtimeBadgesEnabled,
    ].filter(Boolean).length;

    const guardrails = [
      preferences.confirmationsEnabled,
      preferences.financialSummaryVisible,
      preferences.compactDensity,
    ].filter(Boolean).length;

    return {
      guardrails,
      liveSignals,
      productLabel: preferences.productLabel,
    };
  }, [preferences]);

  const hasUnsavedChanges = JSON.stringify(preferences) !== JSON.stringify(savedPreferences);

  return {
    hasUnsavedChanges,
    preferences,
    resetToSaved,
    restoreDefaults,
    savePreferences,
    summary,
    updatePreference,
  };
}
