import type { User } from '@/contexts/appContext.types';
import type { SecuritySettings } from '@/features/settings/components/settings.types';

export function getInitialSecuritySettings(user: User): SecuritySettings {
  return {
    session_timeout: user.session_timeout || 30,
  };
}
