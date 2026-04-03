import { supabase } from '@/lib/supabase/supabase';
import { validateBusinessDomain } from '@/lib/utils/domain';

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

interface CurrentUserRecord {
  email: string | null;
  full_name: string | null;
  website: string | null;
  website_status: WebsiteReviewStatus | null;
  website_submitted_at: string | null;
}

interface LatestProjectRecord {
  id: string;
  domain: string | null;
  ga4_property_id: string | null;
}

interface UserWebsiteUpdate {
  website: string | null;
  website_status: WebsiteReviewStatus;
  website_submitted_at: string | null;
  website_reviewed_at: string | null;
  website_reviewed_by: string | null;
  website_review_notes: string | null;
  updated_at: string;
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

function buildOperationalProjectName(user: Pick<CurrentUserRecord, 'full_name' | 'email'>) {
  const identity = user.full_name?.trim() || user.email?.split('@')[0]?.trim() || 'Cliente';
  return `Web de ${identity}`;
}

export async function reviewUserWebsite(payload: AdminWebsiteReviewPayload): Promise<AdminWebsiteReviewResult> {
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.id) {
    throw new Error('Tu sesion de administrador no esta disponible.');
  }

  const normalizedNotes = normalizeOptionalNotes(payload.notes);
  const normalizedGa4PropertyId = normalizeOptionalGa4PropertyId(payload.ga4PropertyId);
  const shouldValidateDomain = payload.action !== 'reject' || payload.domain.trim().length > 0;
  const validatedDomain = shouldValidateDomain ? validateBusinessDomain(payload.domain) : null;

  if (validatedDomain && !validatedDomain.isValid) {
    throw new Error(validatedDomain.errorMessage || 'La URL ingresada no es valida.');
  }

  const normalizedDomain = validatedDomain?.normalizedDomain ?? null;

  const { data: currentUser, error: currentUserError } = await supabase
    .from('users')
    .select('email, full_name, website, website_status, website_submitted_at')
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

  const userUpdate: UserWebsiteUpdate = {
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
  };

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
    .select('id, domain, ga4_property_id')
    .eq('created_by', payload.userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (projectError) {
    throw new Error('No pudimos revisar el proyecto asociado al cliente.');
  }

  latestProject = (projectData as LatestProjectRecord | null) ?? null;
  let projectCreated = false;

  if (payload.action === 'approve' && normalizedDomain && latestProject?.id) {
    const { error: projectUpdateError } = await supabase
      .from('projects')
      .update({
        domain: normalizedDomain,
        ...(normalizedGa4PropertyId ? { ga4_property_id: normalizedGa4PropertyId } : {}),
        updated_at: timestamp,
      })
      .eq('id', latestProject.id);

    if (projectUpdateError) {
      throw new Error('No pudimos activar el dominio en el proyecto del cliente.');
    }

    latestProject = {
      ...latestProject,
      domain: normalizedDomain,
      ga4_property_id: normalizedGa4PropertyId ?? latestProject.ga4_property_id,
    };
  }

  if (payload.action === 'approve' && normalizedDomain && !latestProject?.id) {
    const typedUser = currentUser as CurrentUserRecord;
    const { data: createdProject, error: createProjectError } = await supabase
      .from('projects')
      .insert({
        name: buildOperationalProjectName(typedUser),
        description: 'Proyecto operativo creado automaticamente al aprobar la URL del cliente.',
        technologies: [],
        status: 'development',
        created_by: payload.userId,
        is_active: true,
        approval_status: 'approved',
        approved_by: authUser.id,
        approved_at: timestamp,
        domain: normalizedDomain,
        ga4_property_id: normalizedGa4PropertyId,
        updated_at: timestamp,
      })
      .select('id, domain, ga4_property_id')
      .single();

    if (createProjectError) {
      throw new Error('No pudimos crear el proyecto asociado al cliente al aprobar la URL.');
    }

    latestProject = createdProject as LatestProjectRecord;
    projectCreated = true;
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
    project_ga4_property_id: latestProject?.ga4_property_id ?? null,
    project_created: projectCreated,
  };
}
