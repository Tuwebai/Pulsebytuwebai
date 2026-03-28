import type { Project } from '@/types/project.types';

export const getErrorDetails = (error: unknown): { message: string; code?: string } => {
  if (error instanceof Error) {
    const errorWithCode = error as Error & { code?: string };

    return {
      message: error.message,
      code: errorWithCode.code,
    };
  }

  return {
    message: 'Error desconocido',
  };
};

export const getAdminProjectStats = (projects: Project[]) => ({
  total: projects.length,
  inProgress: projects.filter(
    (project) => project.status === 'development' || project.status === 'maintenance',
  ).length,
  inProduction: projects.filter((project) => project.status === 'production').length,
  paused: projects.filter((project) => project.status === 'paused').length,
});
