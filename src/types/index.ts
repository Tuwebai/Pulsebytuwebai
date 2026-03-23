// Tipos centrales del Dashboard TuWebAI
// Exporta todos los tipos de dominio desde una ubicación única

// Tipos de Proyecto
export * from './project.types';

// Tipos de Usuario
export * from './user.types';

// Tipos de Ticket
export * from './ticket';

// Tipos de Notificación
export * from './notificacion';

// Tipos de Pago
export * from './pago';

// Re-exportar tipos de Google para compatibilidad
export * from './google';

// Tipos de API comunes
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface IdPayload {
  id: string;
}

export interface TimestampPayload {
  created_at: string;
  updated_at: string;
}

export interface SoftDeletePayload {
  deleted_at?: string;
  is_deleted?: boolean;
}
