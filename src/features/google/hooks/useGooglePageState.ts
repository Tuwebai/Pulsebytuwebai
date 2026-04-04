import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useUserProject } from '@/features/project/hooks/useUserProject';
import { getGoogleConnectionCopy, resolveGoogleConnectionState } from '../services/googlePage.service';

export function useGooglePageState() {
  const { user } = useApp();
  const { domain, projectId } = useUserProject();

  return useMemo(() => {
    const resolvedDomain = domain ?? user?.website ?? null;
    const connectionState = resolveGoogleConnectionState({
      domain,
      website: user?.website,
      websiteStatus: user?.website_status,
    });
    const connectionCopy = getGoogleConnectionCopy(connectionState);

    return {
      connectionCopy,
      connectionState,
      domain: resolvedDomain,
      hasProject: Boolean(projectId),
    };
  }, [domain, projectId, user?.website, user?.website_status]);
}

