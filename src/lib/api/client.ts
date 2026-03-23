/**
 * Cliente HTTP Centralizado - Dashboard TuWeb.ai
 * 
 * Proporciona una capa de abstracción para todas las llamadas HTTP
 * con manejo centralizado de errores y tipado completo.
 * 
 * @version 1.0.0
 */

import type { AxiosRequestConfig } from 'axios';

// ============================================
// INTERFACES DE CONFIGURACIÓN
// ============================================

/**
 * Opciones de configuración para el cliente API
 */
export interface ApiClientConfig {
  /** Base URL para todas las peticiones */
  baseURL: string;
  /** Timeout en milisegundos */
  timeout?: number;
  /** Headers por defecto */
  defaultHeaders?: Record<string, string>;
}

/**
 * Opciones para peticiones HTTP
 */
export interface RequestOptions {
  /** Headers adicionales */
  headers?: Record<string, string>;
  /** Timeout específico para esta petición */
  timeout?: number;
  /** Token de autenticación */
  authToken?: string;
}

/**
 * Respuesta paginada estándar
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================
// INTERFAZ DE ERROR
// ============================================

/**
 * Error personalizado para fallos en la API
 */
export class ApiError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly url: string;
  readonly timestamp: Date;
  readonly isNetworkError: boolean;
  readonly isAuthError: boolean;
  readonly isServerError: boolean;
  readonly isClientError: boolean;

  constructor(params: {
    status: number;
    statusText: string;
    url: string;
    message?: string;
  }) {
    const { status, statusText, url, message } = params;
    
    // Mensaje por defecto basado en el código de estado
    const defaultMessage = message || ApiError.getDefaultMessage(status, statusText);
    
    super(defaultMessage);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.url = url;
    this.timestamp = new Date();
    
    // Clasificar el tipo de error
    this.isNetworkError = status === 0;
    this.isAuthError = status === 401 || status === 403;
    this.isServerError = status >= 500;
    this.isClientError = status >= 400 && status < 500 && !this.isAuthError;
  }

  /**
   * Genera mensaje por defecto según código de estado HTTP
   */
  private static getDefaultMessage(status: number, statusText: string): string {
    if (status === 0) {
      return 'Error de conexión. Verifica tu conexión a internet.';
    }
    if (status === 401) {
      return 'Sesión expirada. Por favor, inicia sesión nuevamente.';
    }
    if (status === 403) {
      return 'No tienes permisos para realizar esta acción.';
    }
    if (status === 404) {
      return 'Recurso no encontrado.';
    }
    if (status >= 500) {
      return 'Error del servidor. Por favor, intenta más tarde.';
    }
    return statusText || 'Ha ocurrido un error desconocido.';
  }

  /**
   * Serializa el error para logging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      statusText: this.statusText,
      url: this.url,
      timestamp: this.timestamp.toISOString(),
      isNetworkError: this.isNetworkError,
      isAuthError: this.isAuthError,
      isServerError: this.isServerError,
      isClientError: this.isClientError,
    };
  }
}

// ============================================
// CLASE API CLIENT
// ============================================

/**
 * Cliente HTTP centralizado para todas las llamadas API
 */
export class ApiClient {
  private readonly baseURL: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly defaultTimeout: number;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL.replace(/\/$/, ''); // Eliminar trailing slash
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.defaultHeaders,
    };
    this.defaultTimeout = config.timeout ?? 30000;
  }

  /**
   * Construye la URL completa combinando baseURL con path
   */
  private buildURL(path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${this.baseURL}${cleanPath}`;
  }

  /**
   * Construye los headers completos combinando headers por defecto y personalizados
   */
  private buildHeaders(options?: RequestOptions): HeadersInit {
    const headers: Record<string, string> = { ...this.defaultHeaders };
    
    if (options?.headers) {
      Object.assign(headers, options.headers);
    }
    
    if (options?.authToken) {
      headers['Authorization'] = `Bearer ${options.authToken}`;
    }
    
    return headers;
  }

  /**
   * Realiza una petición HTTP genérica
   */
  private async request<T>(
    method: string,
    path: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const url = this.buildURL(path);
    const timeout = options?.timeout ?? this.defaultTimeout;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: this.buildHeaders(options),
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      // Manejar respuestas sin contenido
      if (response.status === 204) {
        return undefined as T;
      }

      // Verificar si la respuesta es JSON
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const responseData = await response.json();
        
        if (!response.ok) {
          throw new ApiError({
            status: response.status,
            statusText: response.statusText,
            url,
            message: responseData.message || responseData.error,
          });
        }
        
        return responseData as T;
      }

      // Si no es JSON pero la respuesta es OK
      if (response.ok) {
        return response.text() as unknown as T;
      }

      // Error si no es OK y no es JSON
      throw new ApiError({
        status: response.status,
        statusText: response.statusText,
        url,
      });
    } catch (error) {
      // Manejar errores de red
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError({
          status: 0,
          statusText: 'Network Error',
          url,
          message: 'Error de conexión. Verifica tu conexión a internet.',
        });
      }

      // Re-lanzar errores de tipo ApiError
      if (error instanceof ApiError) {
        throw error;
      }

      // Manejar abort por timeout
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError({
          status: 408,
          statusText: 'Request Timeout',
          url,
          message: 'La petición ha expirado. Por favor, intenta nuevamente.',
        });
      }

      // Error desconocido
      throw new ApiError({
        status: 0,
        statusText: 'Unknown Error',
        url,
        message: error instanceof Error ? error.message : 'Error desconocido',
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Realiza una petición GET
   */
  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', path, undefined, options);
  }

  /**
   * Realiza una petición POST
   */
  async post<T>(path: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', path, data, options);
  }

  /**
   * Realiza una petición PUT
   */
  async put<T>(path: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', path, data, options);
  }

  /**
   * Realiza una petición PATCH
   */
  async patch<T>(path: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', path, data, options);
  }

  /**
   * Realiza una petición DELETE
   */
  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, undefined, options);
  }
}

// ============================================
// INSTANCIA POR DEFECTO
// ============================================

/**
 * Crea una instancia configurada del ApiClient
 * 
 * @example
 * ```typescript
 * const api = createApiClient({
 *   baseURL: import.meta.env.VITE_API_URL || 'https://api.example.com',
 *   timeout: 30000,
 * });
 * ```
 */
export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}

/**
 * Instancia por defecto del cliente API
 * Lee la URL base desde las variables de entorno
 */
export const apiClient = createApiClient({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  defaultHeaders: {
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },
});

// ============================================
// RE-EXPORT AXIOS CONFIG (compatibilidad)
// ============================================

/**
 * Tipo para configuración de axios (compatibilidad futura)
 */
export type { AxiosRequestConfig };
