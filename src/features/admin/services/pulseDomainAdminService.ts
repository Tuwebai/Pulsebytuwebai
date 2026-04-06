import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js';

import { supabase } from '@/data/supabase/client';
import { validateBusinessDomain } from '@/features/pulse/utils/domainValidation';

export type WebsiteReviewStatus = 'missing' | 'pending_review' | 'approved' | 'rejected';
export type WebsiteReviewAction = 'save_pending' | 'approve' | 'reject';

export interface AdminWebsiteReviewPayload {
  userId: string;
  domain: string;
  action: WebsiteReviewAction;
  ga4PropertyId?: string | null;
  notes?: string | null;
}

export interface AdminWebsiteReviewResult {
  user_id: string;
  website: string | null;
  website_status: WebsiteReviewStatus;
  website_submitted_at: string | null;
  website_reviewed_at: string | null;
  website_reviewed_by: string | null;
  website_review_notes: string | null;
  project_id: string | null;
  project_domain: string | null;
  project_ga4_property_id: string | null;
  project_created: boolean;
}

function normalizeOptionalNotes(notes?: string | null): string | null {
  const trimmed = notes?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeOptionalGa4PropertyId(value?: string | null): string | null {
  const trimmed = value?.trim() ?? '';

  if (!trimmed) {
    return null;
  }

  if (!/^\d+$/.test(trimmed)) {
    throw new Error('El Property ID de GA4 debe contener solo números.');
  }

  return trimmed;
}

export async function reviewUserWebsite(payload: AdminWebsiteReviewPayload): Promise<AdminWebsiteReviewResult> {
  const normalizedNotes = normalizeOptionalNotes(payload.notes);
  const normalizedGa4PropertyId = normalizeOptionalGa4PropertyId(payload.ga4PropertyId);
  const shouldValidateDomain = payload.action !== 'reject' || payload.domain.trim().length > 0;
  const validatedDomain = shouldValidateDomain ? validateBusinessDomain(payload.domain) : null;

  if (validatedDomain && !validatedDomain.isValid) {
    throw new Error(validatedDomain.errorMessage || 'La URL ingresada no es valida.');
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Tu sesión de administrador no está disponible para revisar la URL del cliente.');
  }

  const { data, error } = await supabase.functions.invoke('review-user-website', {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: {
      userId: payload.userId,
      domain: payload.domain,
      action: payload.action,
      ga4PropertyId: normalizedGa4PropertyId,
      notes: normalizedNotes,
    },
  });

  if (error) {
    if (error instanceof FunctionsHttpError) {
      const response = (await error.context.json().catch(() => null)) as { error?: string; message?: string; reason?: string } | null;

      if (error.context.status === 400 && response?.message) {
        throw new Error(response.message);
      }

      if (error.context.status === 401) {
        throw new Error('Tu sesión no tiene permisos para revisar la URL del cliente.');
      }

      if (error.context.status === 403) {
        throw new Error('Solo un administrador puede revisar la URL del cliente.');
      }

      if (error.context.status === 404 && response?.error === 'USER_NOT_FOUND') {
        throw new Error('No encontramos el usuario a revisar.');
      }

      if (error.context.status === 500 && response?.reason) {
        throw new Error(`No pudimos actualizar la configuración del cliente: ${response.reason}.`);
      }

      throw new Error('No pudimos actualizar la configuración del cliente.');
    }

    if (error instanceof FunctionsRelayError) {
      throw new Error('El relay de Supabase rechazó la revisión de la URL del cliente.');
    }

    if (error instanceof FunctionsFetchError) {
      throw new Error('No pudimos conectarnos con la función que revisa la URL del cliente.');
    }

    throw new Error('No pudimos revisar la URL del cliente.');
  }

  if (!data || typeof data !== 'object') {
    throw new Error('La respuesta para revisar la URL del cliente vino incompleta.');
  }

  return data as AdminWebsiteReviewResult;
}
