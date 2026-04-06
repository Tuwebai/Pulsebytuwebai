import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApp } from '@/contexts/useApp';
import { fetchPreferences, updatePreferences } from '@/api/notifications/notificationsApi';
import type { NotificationPreferences } from '@/data/types/notifications';
import { notificationQueryKeys } from './notificationQueryKeys';

export function useNotificationPreferences() {
  const { user } = useApp();
  const queryClient = useQueryClient();
  const queryKey = notificationQueryKeys.preferences(user?.id ?? null);

  const { data: prefs, isLoading } = useQuery({
    queryKey,
    queryFn: fetchPreferences,
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60 * 10
  });

  const update = useMutation({
    mutationFn: updatePreferences,
    onMutate: async (nextPrefs: Partial<NotificationPreferences>) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<NotificationPreferences>(queryKey);

      queryClient.setQueryData<NotificationPreferences>(queryKey, {
        ...(previous || {
          notif_new_consultation: true,
          notif_monthly_summary: true,
          notif_project_update: false
        }),
        ...nextPrefs
      });

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
    }
  });

  return {
    prefs,
    isLoading,
    updatePreference: update.mutate,
    isSaving: update.isPending
  };
}
