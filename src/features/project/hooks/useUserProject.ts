import { useMemo } from 'react';
import { useApp } from '@/contexts/useApp';

export function useUserProject() {
  const { getUserProjects, loading, projectsReady } = useApp();

  return useMemo(() => {
    const project = getUserProjects()[0] || null;

    return {
      project,
      projectId: project?.id || null,
      domain: project?.domain || null,
      ga4PropertyId: project?.ga4_property_id || null,
      loading,
      projectsReady
    };
  }, [getUserProjects, loading, projectsReady]);
}
