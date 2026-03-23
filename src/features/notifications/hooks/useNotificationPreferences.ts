import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPreferences, updatePreferences } from '@/api/notifications/notificationsApi';
import type { NotificationPreferences } from '@/data/types/notifications';

export function useNotificationPreferences() {
  const queryClient = useQueryClient();

  const { data: prefs, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: fetchPreferences,
    staleTime: 1000 * 60 * 10
  });

  const update = useMutation({
    mutationFn: updatePreferences,
    onMutate: async (nextPrefs: Partial<NotificationPreferences>) => {
      await queryClient.cancelQueries({ queryKey: ['notification-preferences'] });
      const previous = queryClient.getQueryData<NotificationPreferences>(['notification-preferences']);

      queryClient.setQueryData<NotificationPreferences>(['notification-preferences'], {
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
        queryClient.setQueryData(['notification-preferences'], context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    }
  });

  return {
    prefs,
    isLoading,
    updatePreference: update.mutate,
    isSaving: update.isPending
  };
}
