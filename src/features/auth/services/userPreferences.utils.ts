import type { JsonValue, LocalStoragePreferenceMigration } from '@/features/auth/services/userPreferences.types';

export const localStoragePreferenceMigrations: LocalStoragePreferenceMigration[] = [
  { type: 'theme', key: 'theme', getValue: () => localStorage.getItem('theme') },
  { type: 'dashboard_widgets', key: 'dashboard_widgets', getValue: () => localStorage.getItem('dashboard_widgets') },
  { type: 'dashboard_layouts', key: 'dashboard_layouts', getValue: () => localStorage.getItem('dashboardLayouts') },
  { type: 'language', key: 'i18nextLng', getValue: () => localStorage.getItem('i18nextLng') },
  { type: 'welcome_back', key: 'tuwebai_welcome_back', getValue: () => localStorage.getItem('tuwebai_welcome_back') },
];

export const localStoragePreferenceKeys = [
  'theme',
  'dashboard_widgets',
  'dashboardLayouts',
  'i18nextLng',
  'tuwebai_welcome_back',
];

export function parseStoredPreferenceValue(value: string): JsonValue {
  const normalized = value.trim();

  if (!shouldParseAsJson(normalized)) {
    return value;
  }

  try {
    return JSON.parse(normalized) as JsonValue;
  } catch {
    return value;
  }
}

export function isThemeValue(value: JsonValue): value is 'dark' {
  return value === 'dark';
}

export function isStringArray(value: JsonValue): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export function isPreferencesAuthError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const code = 'code' in error ? String(error.code ?? '') : '';
  const message = 'message' in error ? String(error.message ?? '') : '';

  return code === '42501' || message.includes('401') || message.toLowerCase().includes('unauthorized');
}

function shouldParseAsJson(value: string): boolean {
  if (!value) {
    return false;
  }

  return (
    value.startsWith('{') ||
    value.startsWith('[') ||
    value.startsWith('"') ||
    value === 'true' ||
    value === 'false' ||
    value === 'null' ||
    /^-?\d+(\.\d+)?$/.test(value)
  );
}
