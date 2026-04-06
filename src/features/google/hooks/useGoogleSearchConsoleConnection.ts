import { useQuery } from '@tanstack/react-query';
import { useApp } from '@/contexts/AppContext';
import type { GoogleSearchConsoleConnection } from '@/data/types/google';
import { getGoogleSearchConsoleConnection } from '@/api/googleSearchConsole.api';

export function useGoogleSearchConsoleConnection(projectId: string | null) {
  const { authReady, isAuthenticated } = useApp();

  return useQuery<GoogleSearchConsoleConnection | null>({
    queryKey: ['google-search-console-connection', projectId, authReady, isAuthenticated],
    queryFn: () => getGoogleSearchConsoleConnection(projectId!),
    enabled: Boolean(projectId && authReady && isAuthenticated),
    refetchOnMount: 'always',
    retry: 2,
    staleTime: 60_000,
  });
}
