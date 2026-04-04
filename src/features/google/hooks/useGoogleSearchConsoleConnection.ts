import { useQuery } from '@tanstack/react-query';
import type { GoogleSearchConsoleConnection } from '@/data/types/google';
import { getGoogleSearchConsoleConnection } from '@/api/googleSearchConsole.api';

export function useGoogleSearchConsoleConnection(projectId: string | null) {
  return useQuery<GoogleSearchConsoleConnection | null>({
    queryKey: ['google-search-console-connection', projectId],
    queryFn: () => getGoogleSearchConsoleConnection(projectId!),
    enabled: Boolean(projectId),
    staleTime: 60_000,
  });
}

