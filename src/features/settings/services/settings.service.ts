import type { User } from '@/contexts/appContext.types';
import type { PerformanceSettings, SecuritySettings } from '@/features/settings/components/settings.types';
import { updateClientSettings } from '@/features/settings/api/settingsApi';

export function getInitialPerformanceSettings(user: User): PerformanceSettings {
  return {
    animations_enabled: user.animations_enabled !== false,
    low_bandwidth_mode: user.low_bandwidth_mode || false,
  };
}

export function getInitialSecuritySettings(user: User): SecuritySettings {
  return {
    two_factor_auth: user.two_factor_auth || false,
    session_timeout: user.session_timeout || 30,
    login_notifications: user.login_notifications !== false,
    device_management: user.device_management !== false,
  };
}

export async function savePerformanceSettings(userId: string, settings: PerformanceSettings): Promise<void> {
  await updateClientSettings(userId, settings);
}

export async function saveSecuritySettings(userId: string, settings: SecuritySettings): Promise<void> {
  await updateClientSettings(userId, settings);
}
