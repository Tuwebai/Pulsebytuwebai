import { BarChart2, FolderOpen, MessageSquare } from 'lucide-react';
import Skeleton from '@/core/components/Skeleton';
import type { NotificationPreferences } from '@/data/types/notifications';
import { useNotificationPreferences } from '../hooks/useNotificationPreferences';
import { NotificationPreferenceToggle } from './NotificationPreferenceToggle';
import { NotificationPushSubscriptionCard } from './NotificationPushSubscriptionCard';

const ITEMS: Array<{
  key: keyof NotificationPreferences;
  title: string;
  description: string;
  icon: typeof MessageSquare;
}> = [
  {
    key: 'notif_new_consultation',
    title: 'Nueva consulta en tu web',
    description: 'Te avisamos cada vez que alguien se contacta.',
    icon: MessageSquare,
  },
  {
    key: 'notif_monthly_summary',
    title: 'Resumen mensual',
    description: 'Recibís el resumen de tu web el primer día de cada mes.',
    icon: BarChart2,
  },
  {
    key: 'notif_project_update',
    title: 'Actualizaciones del proyecto',
    description: 'Novedades del equipo de TuWebAI sobre tu proyecto.',
    icon: FolderOpen,
  },
];

interface NotificationSettingsSectionProps {
  prefs?: NotificationPreferences;
  isLoading?: boolean;
  isSaving?: boolean;
  updatePreference?: (nextPrefs: Partial<NotificationPreferences>) => void;
}

export function NotificationSettingsSection({
  prefs: providedPrefs,
  isLoading: providedIsLoading,
  isSaving: providedIsSaving,
  updatePreference: providedUpdatePreference,
}: NotificationSettingsSectionProps = {}) {
  const notificationPreferences = useNotificationPreferences();
  const prefs = providedPrefs ?? notificationPreferences.prefs;
  const isLoading = providedIsLoading ?? notificationPreferences.isLoading;
  const isSaving = providedIsSaving ?? notificationPreferences.isSaving;
  const updatePreference = providedUpdatePreference ?? notificationPreferences.updatePreference;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} height="88px" rounded="lg" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {ITEMS.map((item) => {
        const Icon = item.icon;
        const checked = prefs?.[item.key] ?? false;

        return (
          <NotificationPreferenceToggle
            key={item.key}
            checked={checked}
            description={item.description}
            disabled={isSaving}
            icon={<Icon className="h-5 w-5" strokeWidth={1.75} />}
            title={item.title}
            onChange={(next) => updatePreference({ [item.key]: next })}
          />
        );
      })}

      <NotificationPushSubscriptionCard />
    </div>
  );
}
