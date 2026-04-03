export interface AppError {
  code?: string;
  message: string;
  details?: string;
  hint?: string;
  status?: number;
}

export type SupabaseError = AppError;
