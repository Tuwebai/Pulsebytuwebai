export type BusinessIndustry =
  | 'gastronomia'
  | 'salud'
  | 'legal'
  | 'estetica'
  | 'fitness'
  | 'educacion'
  | 'inmobiliaria'
  | 'tecnologia'
  | 'comercio'
  | 'otro';

export interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  business_name: string | null;
  business_industry: BusinessIndustry | null;
  profile_completed: boolean;
  updated_at: string;
}

export interface ProfileUpdatePayload {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  business_name?: string;
  business_industry?: BusinessIndustry;
}
