import { useCallback, useEffect, useState } from 'react';

import { toast } from '@/hooks/use-toast';

import {
  getAdminProjectTracking,
  saveAdminProjectTrackingPhase,
} from '@/features/admin/projects-tracking/services/adminProjectTracking.service';
import type {
  AdminProjectTrackingPhaseInput,
  AdminProjectTrackingProject,
} from '@/features/admin/projects-tracking/types/adminProjectTracking';

interface UseAdminProjectTrackingResult {
  loading: boolean;
  savingPhase: boolean;
  error: string | null;
  project: AdminProjectTrackingProject | null;
  refresh: () => Promise<void>;
  savePhase: (input: AdminProjectTrackingPhaseInput, currentPhaseKey?: string) => Promise<boolean>;
}

export function useAdminProjectTracking(
  projectId: string | undefined,
  refreshSignal = 0,
): UseAdminProjectTrackingResult {
  const [loading, setLoading] = useState(true);
  const [savingPhase, setSavingPhase] = useState(false);
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

  const savePhase = useCallback(
    async (input: AdminProjectTrackingPhaseInput, currentPhaseKey?: string) => {
      if (!project) {
        toast({
          title: 'Error',
          description: 'No pudimos guardar la fase porque el proyecto todavía no está cargado.',
          variant: 'destructive',
        });
        return false;
      }

      try {
        setSavingPhase(true);
        setError(null);
        const nextProject = await saveAdminProjectTrackingPhase(project, input, currentPhaseKey);
        setProject(nextProject);
        toast({
          title: currentPhaseKey ? 'Fase actualizada' : 'Fase creada',
          description: currentPhaseKey
            ? 'La fase quedó actualizada en el seguimiento operativo.'
            : 'La fase quedó cargada en el seguimiento operativo.',
        });
        return true;
      } catch (saveError) {
        console.error('Error guardando fase operativa:', saveError);
        toast({
          title: 'Error',
          description: 'No pudimos guardar la fase en la base operativa.',
          variant: 'destructive',
        });
        return false;
      } finally {
        setSavingPhase(false);
      }
    },
    [project],
  );

  return {
    loading,
    savingPhase,
    error,
    project,
    refresh,
    savePhase,
  };
}
