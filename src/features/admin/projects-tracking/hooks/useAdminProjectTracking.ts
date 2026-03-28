import { useCallback, useEffect, useState } from 'react';

import { toast } from '@/hooks/use-toast';

import { getAdminProjectTracking } from '@/features/admin/projects-tracking/services/adminProjectTracking.service';
import type { AdminProjectTrackingProject } from '@/features/admin/projects-tracking/types/adminProjectTracking';

interface UseAdminProjectTrackingResult {
  loading: boolean;
  error: string | null;
  project: AdminProjectTrackingProject | null;
  refresh: () => Promise<void>;
}

export function useAdminProjectTracking(
  projectId: string | undefined,
  refreshSignal = 0,
): UseAdminProjectTrackingResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<AdminProjectTrackingProject | null>(null);

  const loadProject = useCallback(async () => {
    if (!projectId) {
      setError('Proyecto no encontrado.');
      setProject(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const nextProject = await getAdminProjectTracking(projectId);
      setProject(nextProject);
    } catch (loadError) {
      console.error('Error cargando seguimiento operativo del proyecto:', loadError);
      setError('No pudimos cargar el seguimiento operativo del proyecto.');
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadProject();
  }, [loadProject, refreshSignal]);

  const refresh = useCallback(async () => {
    await loadProject();
    toast({
      title: 'Actualizado',
      description: 'Seguimiento operativo actualizado correctamente.',
    });
  }, [loadProject]);

  return {
    loading,
    error,
    project,
    refresh,
  };
}
