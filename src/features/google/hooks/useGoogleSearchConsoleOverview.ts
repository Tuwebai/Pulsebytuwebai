import { useQuery } from '@tanstack/react-query';
import type { GoogleSearchConsoleConnection, GoogleSearchConsoleOverview } from '@/data/types/google';
import { getGoogleSearchConsoleOverview } from '../services/googleOverview.service';

export function useGoogleSearchConsoleOverview(projectId: string | null, connection: GoogleSearchConsoleConnection | null) {
  return useQuery<GoogleSearchConsoleOverview>({
    queryKey: ['google-search-console-overview', projectId, connection?.updatedAt],
    queryFn: () => getGoogleSearchConsoleOverview(projectId!, connection),
    enabled: Boolean(projectId && connection?.connectionStatus === 'connected'),
    staleTime: 60_000,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}
