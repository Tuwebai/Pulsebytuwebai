import { useQuery } from '@tanstack/react-query';
import type { PulseExperienceSettings } from '@/data/types/pulse';
import { getPulseExperienceSettings } from '@/features/pulse/services/pulseSettings.service';

export function usePulseExperienceSettings() {
  return useQuery<PulseExperienceSettings>({
    queryKey: ['pulse-experience-settings'],
    queryFn: getPulseExperienceSettings,
    staleTime: 60_000,
  });
}
