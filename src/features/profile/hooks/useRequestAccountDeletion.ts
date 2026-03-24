import { useMutation } from '@tanstack/react-query';
import { useApp } from '@/contexts/AppContext';
import { requestAccountDeletion } from '@/features/profile/services/profile.service';

export function useRequestAccountDeletion() {
  const { user } = useApp();

  const mutation = useMutation({
    mutationFn: async () => requestAccountDeletion(user!.id, user!.email)
  });

  return {
    requestDeletion: mutation.mutateAsync,
    isRequesting: mutation.isPending,
    error: mutation.error,
    isSuccess: mutation.isSuccess
  };
}
