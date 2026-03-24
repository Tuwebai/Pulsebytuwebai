import { useQuery } from '@tanstack/react-query';
import { useApp } from '@/contexts/AppContext';
import { getProfile } from '@/features/profile/services/profile.service';

export function useProfile() {
  const { user } = useApp();

  const query = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => getProfile(user!.id),
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60 * 5
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch
  };
}
