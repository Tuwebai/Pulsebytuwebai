import { useQuery } from '@tanstack/react-query';

import { useApp } from '@/contexts/AppContext';
import { getAccountDeletionRequest } from '@/features/profile/services/accountDeletion.service';

export function useAccountDeletionRequest() {
  const { user } = useApp();

  return useQuery({
    queryKey: ['profile', 'account-deletion-request', user?.id],
    queryFn: () => getAccountDeletionRequest(user!.id),
    enabled: Boolean(user?.id),
    staleTime: 15_000,
  });
}
