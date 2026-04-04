import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useUserProject } from '@/features/project/hooks/useUserProject';
import { useGoogleSearchConsoleConnection } from './useGoogleSearchConsoleConnection';
import {
  getGoogleConnectionCopy,
  getGoogleConnectionStatusCopy,
  resolveGoogleConnectionState,
} from '../services/googlePage.service';

export function useGooglePageState() {
  const { user } = useApp();
  const { domain, projectId } = useUserProject();
  const connectionQuery = useGoogleSearchConsoleConnection(projectId);

  return useMemo(() => {
    const resolvedDomain = domain ?? user?.website ?? null;
    const connectionState = resolveGoogleConnectionState({
      domain,
      website: user?.website,
      websiteStatus: user?.website_status,
    });
    const connectionCopy =
      getGoogleConnectionStatusCopy(connectionQuery.data ?? null) ?? getGoogleConnectionCopy(connectionState);

    return {
      connectionCopy,
      connectionRecord: connectionQuery.data ?? null,
      connectionState,
      domain: resolvedDomain,
      hasProject: Boolean(projectId),
      isLoadingConnection: connectionQuery.isLoading,
      projectId,
    };
  }, [
    connectionQuery.data,
    connectionQuery.isLoading,
    domain,
    projectId,
    user?.website,
    user?.website_status,
  ]);
}
