import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders, ensureAuthenticatedAdmin, getErrorReason, isPlainObject, jsonResponse, validateBusinessDomain } from './shared.ts';

type WebsiteReviewStatus = 'missing' | 'pending_review' | 'approved' | 'rejected';
type WebsiteReviewAction = 'save_pending' | 'approve' | 'reject';

interface ReviewUserWebsiteBody {
  userId?: string;
  domain?: string;
  action?: WebsiteReviewAction;
  ga4PropertyId?: string | null;
  notes?: string | null;
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
    throw new Error('INVALID_GA4_PROPERTY_ID');
  }

  return trimmed;
}

function buildOperationalProjectName(user: Pick<CurrentUserRecord, 'full_name' | 'email'>) {
  const identity = user.full_name?.trim() || user.email?.split('@')[0]?.trim() || 'Cliente';
  return `Web de ${identity}`;
}

function isValidPayload(body: unknown): body is Required<Pick<ReviewUserWebsiteBody, 'userId' | 'domain' | 'action'>> & ReviewUserWebsiteBody {
  return (
    isPlainObject(body) &&
    typeof body.userId === 'string' &&
    body.userId.trim().length > 0 &&
    typeof body.domain === 'string' &&
    (body.action === 'save_pending' || body.action === 'approve' || body.action === 'reject')
  );
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'METHOD_NOT_ALLOWED' });
  }

  const authorization = req.headers.get('Authorization');

  if (!authorization) {
    return jsonResponse(401, { error: 'UNAUTHORIZED' });
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return jsonResponse(400, { error: 'INVALID_JSON' });
  }

  if (!isValidPayload(body)) {
    return jsonResponse(400, { error: 'INVALID_PAYLOAD' });
  }

  try {
    const { adminClient, authUserId } = await ensureAuthenticatedAdmin(authorization);
    const payload = body as ReviewUserWebsiteBody;
    const normalizedNotes = normalizeOptionalNotes(payload.notes);
    const normalizedGa4PropertyId = normalizeOptionalGa4PropertyId(payload.ga4PropertyId);
    const shouldValidateDomain = payload.action !== 'reject' || payload.domain.trim().length > 0;
    const validatedDomain = shouldValidateDomain ? validateBusinessDomain(payload.domain) : null;

    if (validatedDomain && !validatedDomain.isValid) {
      return jsonResponse(400, { error: 'INVALID_DOMAIN', message: validatedDomain.errorMessage });
    }

    const normalizedDomain = validatedDomain?.normalizedDomain ?? null;
    const { data: currentUser, error: currentUserError } = await adminClient
      .from('users')
      .select('email, full_name, website, website_status, website_submitted_at')
      .eq('id', payload.userId.trim())
      .maybeSingle();

    if (currentUserError) {
      throw currentUserError;
    }

    if (!currentUser) {
      return jsonResponse(404, { error: 'USER_NOT_FOUND' });
    }

    const timestamp = new Date().toISOString();
    const typedCurrentUser = currentUser as CurrentUserRecord;
    const submittedAt =
      payload.action === 'save_pending'
        ? timestamp
        : typedCurrentUser.website_submitted_at ?? timestamp;

    const website = payload.action === 'reject' ? normalizedDomain ?? typedCurrentUser.website : normalizedDomain;

    const userUpdate = {
      website,
      website_status: payload.action === 'approve' ? 'approved' : payload.action === 'reject' ? 'rejected' : 'pending_review',
      website_submitted_at: website ? submittedAt : null,
      website_reviewed_at: payload.action === 'save_pending' ? null : timestamp,
      website_reviewed_by: payload.action === 'save_pending' ? null : authUserId,
      website_review_notes: normalizedNotes,
      updated_at: timestamp,
    };

    const { error: userUpdateError } = await adminClient.from('users').update(userUpdate).eq('id', payload.userId.trim());
    if (userUpdateError) {
      throw userUpdateError;
    }

    const { data: projectData, error: projectError } = await adminClient
      .from('projects')
      .select('id, domain, ga4_property_id')
      .eq('created_by', payload.userId.trim())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (projectError) {
      throw projectError;
    }

    let latestProject = (projectData as LatestProjectRecord | null) ?? null;
    let projectCreated = false;

    if (payload.action === 'approve' && normalizedDomain && latestProject?.id) {
      const { error: projectUpdateError } = await adminClient
        .from('projects')
        .update({
          domain: normalizedDomain,
          ...(normalizedGa4PropertyId ? { ga4_property_id: normalizedGa4PropertyId } : {}),
          updated_at: timestamp,
        })
        .eq('id', latestProject.id);

      if (projectUpdateError) {
        throw projectUpdateError;
      }

      latestProject = {
        ...latestProject,
        domain: normalizedDomain,
        ga4_property_id: normalizedGa4PropertyId ?? latestProject.ga4_property_id,
      };
    }

    if (payload.action === 'approve' && normalizedDomain && !latestProject?.id) {
      const { data: createdProject, error: createProjectError } = await adminClient
        .from('projects')
        .insert({
          name: buildOperationalProjectName(typedCurrentUser),
          description: 'Proyecto operativo creado automaticamente al aprobar la URL del cliente.',
          technologies: [],
          status: 'development',
          created_by: payload.userId.trim(),
          is_active: true,
          approval_status: 'approved',
          approved_by: authUserId,
          approved_at: timestamp,
          domain: normalizedDomain,
          ga4_property_id: normalizedGa4PropertyId,
          updated_at: timestamp,
        })
        .select('id, domain, ga4_property_id')
        .single();

      if (createProjectError) {
        throw createProjectError;
      }

      latestProject = createdProject as LatestProjectRecord;
      projectCreated = true;
    }

    return jsonResponse(200, {
      user_id: payload.userId.trim(),
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
    });
  } catch (error) {
    const message = getErrorReason(error);

    if (message === 'UNAUTHORIZED') {
      return jsonResponse(401, { error: message });
    }

    if (message === 'FORBIDDEN') {
      return jsonResponse(403, { error: message });
    }

    if (message === 'INVALID_GA4_PROPERTY_ID') {
      return jsonResponse(400, { error: message, message: 'El Property ID de GA4 debe contener solo numeros.' });
    }

    console.error('Error en review-user-website:', message);
    return jsonResponse(500, {
      error: 'REVIEW_USER_WEBSITE_FAILED',
      reason: message,
    });
  }
});
