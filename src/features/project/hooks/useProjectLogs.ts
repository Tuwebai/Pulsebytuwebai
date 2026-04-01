import { useCallback } from 'react';

import { deleteCachedData, getCachedData, setCachedData } from '@/contexts/appContext.cache';
import type { ProjectLog, User } from '@/contexts/appContext.types';

export function useProjectLogs(logs: ProjectLog[], user: User | null) {
  const addLog = useCallback(async () => {
    try {
      if (user) {
        deleteCachedData(`logs_${user.email}`);
      }
    } catch {
      // Los logs no son críticos para bloquear la UI.
    }
  }, [user]);

  const getProjectLogs = useCallback(
    (projectId: string) => {
      const cacheKey = `project_logs_${projectId}`;
      const cachedLogs = getCachedData<ProjectLog[]>(cacheKey);

      if (cachedLogs) {
        return cachedLogs;
      }

      const projectLogs = logs.filter((log) => log.projectId === projectId);
      setCachedData(cacheKey, projectLogs, 5 * 60 * 1000);

      return projectLogs;
    },
    [logs],
  );

  return {
    addLog,
    getProjectLogs,
  };
}
