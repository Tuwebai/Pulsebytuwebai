import type { Dispatch, SetStateAction } from 'react';

import type { Project, ProjectLog, User } from '@/contexts/appContext.types';

import type { AppProjectInput } from '@/features/project/hooks/appProjects.payloads';
import { useProjectCollection } from '@/features/project/hooks/useProjectCollection';
import { useProjectLogs } from '@/features/project/hooks/useProjectLogs';
import { useProjectMutations } from '@/features/project/hooks/useProjectMutations';
import { useProjectPhaseMutations } from '@/features/project/hooks/useProjectPhaseMutations';

interface UseAppProjectsParams {
  logs: ProjectLog[];
  setError: (value: string | null) => void;
  setLoading: (value: boolean) => void;
  setLogs: Dispatch<SetStateAction<ProjectLog[]>>;
  setProjects: Dispatch<SetStateAction<Project[]>>;
  setProjectsReady: Dispatch<SetStateAction<boolean>>;
  user: User | null;
  projects: Project[];
}

export function useAppProjects({
  logs,
  projects,
  setError,
  setLoading,
  setLogs,
  setProjects,
  setProjectsReady,
  user,
}: UseAppProjectsParams) {
  const collection = useProjectCollection({
    setError,
    setLoading,
    setLogs,
    setProjects,
    setProjectsReady,
    user,
    projects,
  });

  const mutations = useProjectMutations({
    setError,
    setLoading,
    setProjects,
    user,
    invalidateProjectsCache: collection.invalidateProjectsCache,
  });
  const phaseMutations = useProjectPhaseMutations({
    setError,
    setLoading,
    invalidateProjectsCache: collection.invalidateProjectsCache,
  });

  const projectLogs = useProjectLogs(logs, user);

  return {
    ...mutations,
    ...phaseMutations,
    ...projectLogs,
    createProject: (projectData: AppProjectInput) => mutations.createProject(projectData),
    getUserProjects: collection.getUserProjects,
    logs,
    projects,
    refreshData: collection.refreshData,
    setLogs,
    setProjects,
  };
}
