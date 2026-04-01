import type { PulseExperienceSettings } from '@/data/types/pulse';
import { fetchPulseExperienceSettings } from '@/api/pulseAdminSettings.api';

export async function getPulseExperienceSettings(): Promise<PulseExperienceSettings> {
  return fetchPulseExperienceSettings();
}
