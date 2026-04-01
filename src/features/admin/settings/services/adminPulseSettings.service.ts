import type { PulseExperienceSettings } from '@/data/types/pulse';
import {
  fetchPulseExperienceSettings,
  savePulseExperienceSettings,
} from '@/api/pulseAdminSettings.api';

export async function getAdminPulseSettings(): Promise<PulseExperienceSettings> {
  return fetchPulseExperienceSettings();
}

export async function updateAdminPulseSettings(
  settings: PulseExperienceSettings,
  updatedBy: string,
): Promise<PulseExperienceSettings> {
  return savePulseExperienceSettings(settings, updatedBy);
}
