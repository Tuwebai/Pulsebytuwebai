import { errorHandler } from '@/core/errors/errorHandler';

export function setupGlobalErrorHandling(): void {
  window.addEventListener('error', (event) => {
    console.error('Error global no capturado:', event.error);
    errorHandler.handleGenericError(event.error, 'Error Global');
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesa rechazada no manejada:', event.reason);
    errorHandler.handleGenericError(event.reason, 'Promesa Rechazada');
  });
}
