import { useMutation, useQueryClient } from '@tanstack/react-query';

import { submitAccountDeletionRequest } from '@/features/profile/services/accountDeletion.service';
import { useApp } from '@/contexts/useApp';

export function useRequestAccountDeletion() {
  const { user } = useApp();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (reason: string) => submitAccountDeletionRequest(reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['profile', 'account-deletion-request', user?.id],
      });
    },
  });

  return {
    requestDeletion: mutation.mutateAsync,
    isRequesting: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
  };
}
