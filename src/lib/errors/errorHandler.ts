import { toast } from '@/hooks/use-toast';
import type { AppError } from '@/lib/errors/error.types';
import { getErrorCode, getErrorMessage, getErrorTitle, isRecoverableError } from '@/lib/errors/errorUtils';

export class AppErrorHandler {
  private static instance: AppErrorHandler;

  static getInstance(): AppErrorHandler {
    if (!AppErrorHandler.instance) {
      AppErrorHandler.instance = new AppErrorHandler();
    }

    return AppErrorHandler.instance;
  }

  handleSupabaseError(error: unknown, context = 'Operacion'): void {
    console.error(`[${context}] Error:`, error);

    if (getErrorCode(error) === 'PGRST301' || getErrorMessage(error).includes('CORS')) {
      this.showToast('Error de Conexión', 'No se pudo conectar con el servidor. Verifica tu conexión a internet y las variables de entorno.');
      console.error(`[${context}] Error de CORS`);
      return;
    }

    if (getErrorCode(error) === 'PGRST116') {
      this.showToast('Error de Autenticación', 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      console.error(`[${context}] Error de autenticación`);
      return;
    }

    if (getErrorCode(error) === '42501') {
      this.showToast('Error de Permisos', 'No tienes permisos para realizar esta acción. Contacta al administrador si necesitas acceso.');
      console.error(`[${context}] Error de Row Level Security`);
      return;
    }

    if (getErrorCode(error) === '23505') {
      this.showToast('Elemento Duplicado', 'Ya existe un elemento con estos datos. Intenta con información diferente.');
      console.error(`[${context}] Error de duplicado`);
      return;
    }

    if (getErrorCode(error) === '23503') {
      this.showToast('Error de Referencia', 'No se puede realizar esta acción porque hay datos relacionados.');
      console.error(`[${context}] Error de clave foránea`);
      return;
    }

    this.handleGenericError(error, context);
  }

  handleGenericError(error: unknown, context: string): void {
    const message = getErrorMessage(error);

    if (message.includes('Failed to fetch') || message.includes('ERR_CONNECTION_CLOSED')) {
      return;
    }

    this.showToast('Error', `${context}: ${message}`);
    console.error(`[${context}] Error genérico:`, message);
  }

  handleNetworkError(context = 'Operación'): void {
    this.showToast('Error de Red', 'No se pudo conectar con el servidor. Verifica tu conexión a internet.');
    console.error(`[${context}] Error de red`);
  }

  handleValidationError(errors: string[], context = 'Validación'): void {
    const message = errors.length > 0 ? errors.join(', ') : 'Datos inválidos';
    this.showToast('Error de Validación', message);
    console.error(`[${context}] Error de validación:`, errors);
  }

  handlePermissionError(context = 'Operación'): void {
    this.showToast('Sin Permisos', 'No tienes permisos para realizar esta acción.');
    console.error(`[${context}] Error de permisos`);
  }

  private showToast(title: string, description: string): void {
    setTimeout(() => {
      toast({
        title,
        description,
        variant: 'destructive',
      });
    }, 0);
  }
}

export const errorHandler = AppErrorHandler.getInstance();

export function handleSupabaseError(error: unknown, context = 'Operacion'): void {
  errorHandler.handleSupabaseError(error, context);
}

export function handleNetworkError(context = 'Operación'): void {
  errorHandler.handleNetworkError(context);
}

export function handleValidationError(errors: string[], context = 'Validación'): void {
  errorHandler.handleValidationError(errors, context);
}

export function handlePermissionError(context = 'Operación'): void {
  errorHandler.handlePermissionError(context);
}

export function createErrorFallback(error: AppError, onRetry?: () => void) {
  return {
    title: getErrorTitle(error),
    message: error.message,
    hint: error.hint,
    isRecoverable: isRecoverableError(error),
    onRetry,
  };
}

export default errorHandler;
