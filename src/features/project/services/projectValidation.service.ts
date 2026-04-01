import type { CreateProjectData } from '@/types/project.types';

export function validateGitHubUrl(url: string): boolean {
  if (!url) {
    return true;
  }

  const githubRegex = /^https:\/\/github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-._]+$/;
  return githubRegex.test(url);
}

export function validateProjectData(
  data: CreateProjectData,
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('El nombre del proyecto es requerido');
  }

  if (data.name && data.name.length > 255) {
    errors.push('El nombre del proyecto no puede exceder 255 caracteres');
  }

  if (data.description && data.description.length > 10000) {
    errors.push('La descripción no puede exceder 10.000 caracteres');
  }

  if (data.technologies && data.technologies.length > 20) {
    errors.push('No se pueden agregar más de 20 tecnologías');
  }

  if (data.github_repository_url && !validateGitHubUrl(data.github_repository_url)) {
    errors.push('La URL de GitHub no es válida');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
