import type { BusinessIndustry } from '@/data/types/profile';

export const PROFILE_AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp';

export const BUSINESS_INDUSTRY_OPTIONS: Array<{ label: string; value: BusinessIndustry }> = [
  { label: 'Gastronomía', value: 'gastronomia' },
  { label: 'Salud', value: 'salud' },
  { label: 'Legal', value: 'legal' },
  { label: 'Estética', value: 'estetica' },
  { label: 'Fitness', value: 'fitness' },
  { label: 'Educación', value: 'educacion' },
  { label: 'Inmobiliaria', value: 'inmobiliaria' },
  { label: 'Tecnología', value: 'tecnologia' },
  { label: 'Comercio', value: 'comercio' },
  { label: 'Otro', value: 'otro' }
];
