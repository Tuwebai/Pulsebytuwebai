import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ProfileRow, ProfileUpdatePayload } from '@/data/types/profile';
import { useApp } from '@/contexts/useApp';
import { saveProfile } from '@/features/profile/services/profile.service';

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useApp();

  const mutation = useMutation({
    mutationFn: async (data: ProfileUpdatePayload) => {
      await saveProfile(user!.id, data);
      return data;
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['profile', user?.id] });
      const previousProfile = queryClient.getQueryData<ProfileRow>(['profile', user?.id]);

      queryClient.setQueryData<ProfileRow | undefined>(['profile', user?.id], (current) =>
        current
          ? {
              ...current,
              ...newData,
              updated_at: new Date().toISOString(),
              profile_completed: true
            }
          : current
      );

      return { previousProfile };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile', user?.id], context.previousProfile);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    }
  });

  return {
    save: mutation.mutateAsync,
    isSaving: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess
  };
}
