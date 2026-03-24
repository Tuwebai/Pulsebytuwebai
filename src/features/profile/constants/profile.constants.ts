import type { BusinessIndustry } from '@/data/types/profile';

export const PROFILE_AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp';

export const PROFILE_SURFACE_CLASSNAME =
  'rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--bg-surface)] p-5 sm:p-6';

export const PROFILE_INPUT_CLASSNAME =
  'h-11 rounded-[14px] border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus-visible:ring-[var(--signal)] focus-visible:ring-offset-0 disabled:border-[var(--border-default)] disabled:bg-[var(--bg-elevated)] disabled:text-[var(--text-tertiary)] disabled:opacity-100';

export const BUSINESS_INDUSTRY_OPTIONS: Array<{ label: string; value: BusinessIndustry }> = [
  { label: 'Gastronomia', value: 'gastronomia' },
  { label: 'Salud', value: 'salud' },
  { label: 'Legal', value: 'legal' },
  { label: 'Estetica', value: 'estetica' },
  { label: 'Fitness', value: 'fitness' },
  { label: 'Educacion', value: 'educacion' },
  { label: 'Inmobiliaria', value: 'inmobiliaria' },
  { label: 'Tecnologia', value: 'tecnologia' },
  { label: 'Comercio', value: 'comercio' },
  { label: 'Otro', value: 'otro' },
];

export const PROFILE_TABS = [
  { value: 'datos', label: 'Datos' },
  { value: 'negocio', label: 'Negocio' },
  { value: 'seguridad', label: 'Seguridad' },
  { value: 'cuenta', label: 'Cuenta' },
] as const;
