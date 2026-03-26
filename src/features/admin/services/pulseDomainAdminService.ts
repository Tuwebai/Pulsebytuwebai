import { supabase } from '@/lib/supabase';
import { validateBusinessDomain } from '@/lib/utils/domain';

export type WebsiteReviewStatus = 'missing' | 'pending_review' | 'approved' | 'rejected';
export type WebsiteReviewAction = 'save_pending' | 'approve' | 'reject';

export interface AdminWebsiteReviewPayload {
  userId: string;
  domain: string;
  action: WebsiteReviewAction;
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
}

interface CurrentUserRecord {
  website: string | null;
  website_status: WebsiteReviewStatus | null;
  website_submitted_at: string | null;
}

interface LatestProjectRecord {
  id: string;
  domain: string | null;
}

function normalizeOptionalNotes(notes?: string | null): string | null {
  const trimmed = notes?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
}

export async function reviewUserWebsite(payload: AdminWebsiteReviewPayload): Promise<AdminWebsiteReviewResult> {
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.id) {
    throw new Error('Tu sesion de administrador no esta disponible.');
  }

  const normalizedNotes = normalizeOptionalNotes(payload.notes);
  const shouldValidateDomain = payload.action !== 'reject' || payload.domain.trim().length > 0;
  const validatedDomain = shouldValidateDomain ? validateBusinessDomain(payload.domain) : null;

  if (validatedDomain && !validatedDomain.isValid) {
    throw new Error(validatedDomain.errorMessage || 'La URL ingresada no es valida.');
  }

  const normalizedDomain = validatedDomain?.normalizedDomain ?? null;

  const { data: currentUser, error: currentUserError } = await supabase
    .from('users')
    .select('website, website_status, website_submitted_at')
    .eq('id', payload.userId)
    .maybeSingle();

  if (currentUserError) {
    throw new Error('No pudimos leer la URL actual del cliente.');
  }

  if (!currentUser) {
    throw new Error('No encontramos el usuario a revisar.');
  }

  const timestamp = new Date().toISOString();
  const typedCurrentUser = currentUser as CurrentUserRecord;
  const submittedAt =
    payload.action === 'save_pending'
      ? timestamp
      : typedCurrentUser.website_submitted_at ?? timestamp;

  const website =
    payload.action === 'reject'
      ? normalizedDomain ?? typedCurrentUser.website
      : normalizedDomain;

  const userUpdate = {
    website,
    website_status:
      payload.action === 'approve'
        ? 'approved'
        : payload.action === 'reject'
          ? 'rejected'
          : 'pending_review',
    website_submitted_at: website ? submittedAt : null,
    website_reviewed_at: payload.action === 'save_pending' ? null : timestamp,
    website_reviewed_by: payload.action === 'save_pending' ? null : authUser.id,
    website_review_notes: normalizedNotes,
    updated_at: timestamp,
  } satisfies Record<string, string | null>;

  const { error: userUpdateError } = await supabase
    .from('users')
    .update(userUpdate)
    .eq('id', payload.userId);

  if (userUpdateError) {
    throw new Error('No pudimos actualizar la URL del cliente.');
  }

  let latestProject: LatestProjectRecord | null = null;

  const { data: projectData, error: projectError } = await supabase
    .from('projects')
    .select('id, domain')
    .eq('created_by', payload.userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (projectError) {
    throw new Error('No pudimos revisar el proyecto asociado al cliente.');
  }

  latestProject = (projectData as LatestProjectRecord | null) ?? null;

  if (payload.action === 'approve' && normalizedDomain && latestProject?.id) {
    const { error: projectUpdateError } = await supabase
      .from('projects')
      .update({
        domain: normalizedDomain,
        updated_at: timestamp,
      })
      .eq('id', latestProject.id);

    if (projectUpdateError) {
      throw new Error('No pudimos activar el dominio en el proyecto del cliente.');
    }

    latestProject = {
      ...latestProject,
      domain: normalizedDomain,
    };
  }

  return {
    user_id: payload.userId,
    website: website ?? null,
    website_status: userUpdate.website_status,
    website_submitted_at: userUpdate.website_submitted_at,
    website_reviewed_at: userUpdate.website_reviewed_at,
    website_reviewed_by: userUpdate.website_reviewed_by,
    website_review_notes: userUpdate.website_review_notes,
    project_id: latestProject?.id ?? null,
    project_domain: latestProject?.domain ?? null,
  };
}
