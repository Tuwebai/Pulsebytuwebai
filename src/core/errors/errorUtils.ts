import type { AppError } from '@/core/errors/error.types';

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const maybeError = error as { message?: string; details?: string; code?: string };
    return maybeError.message || maybeError.details || maybeError.code || 'Error desconocido';
  }

  return 'Error desconocido';
}

export function getErrorCode(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null) {
    return (error as { code?: string }).code;
  }

  return undefined;
}

export function getErrorTitle(error: AppError): string {
  if (error.code === 'PGRST301' || error.message?.includes('CORS')) {
    return 'Error de Conexión';
  }

  if (error.code === 'PGRST116') {
    return 'Error de Autenticación';
  }

  if (error.code === '23505') {
    return 'Elemento Duplicado';
  }

  if (error.code === '23503') {
    return 'Error de Referencia';
  }

  return 'Error';
}

export function isRecoverableError(error: AppError): boolean {
  return error.code === 'PGRST301' || error.message?.includes('CORS') || error.code === 'PGRST116';
}
