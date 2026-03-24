import { userService } from '@/lib/supabase/supabaseService';
import type { User } from '@/contexts/appContext.types';

type ClientSettingsUpdates = Pick<
  User,
  | 'animations_enabled'
  | 'low_bandwidth_mode'
  | 'two_factor_auth'
  | 'session_timeout'
  | 'login_notifications'
  | 'device_management'
>;

export async function updateClientSettings(userId: string, updates: Partial<ClientSettingsUpdates>): Promise<void> {
  await userService.updateUser(userId, {
    ...updates,
    updated_at: new Date().toISOString(),
  });
}
