import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';

export function useUserProject() {
  const { getUserProjects, loading } = useApp();

  return useMemo(() => {
    const project = getUserProjects()[0] || null;

    return {
      project,
      projectId: project?.id || null,
      domain: project?.domain || null,
      ga4PropertyId: project?.ga4_property_id || null,
      loading
    };
  }, [getUserProjects, loading]);
}
