import { useQuery } from '@tanstack/react-query';
import { useApp } from '@/contexts/useApp';
import type { GoogleSearchConsoleConnection, GoogleSearchConsoleOverview, GoogleSearchConsolePeriod } from '@/data/types/google';
import { getGoogleSearchConsoleOverview } from '../services/googleOverview.service';

export function useGoogleSearchConsoleOverview(
  projectId: string | null,
  connection: GoogleSearchConsoleConnection | null,
  period: GoogleSearchConsolePeriod,
) {
  const { authReady, isAuthenticated } = useApp();

  return useQuery<GoogleSearchConsoleOverview>({
    queryKey: ['google-search-console-overview', projectId, period, connection?.updatedAt, authReady, isAuthenticated],
    queryFn: () => getGoogleSearchConsoleOverview(projectId!, connection, period),
    enabled: Boolean(projectId && connection?.connectionStatus === 'connected' && authReady && isAuthenticated),
    refetchOnMount: 'always',
    staleTime: 60_000,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}
