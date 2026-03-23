import { supabase } from '@/lib/supabase/supabase';

interface EnablePulseAccessResponse {
  invited: boolean;
  onboarding_completed: boolean;
  status: 'enabled';
}

interface PulseUserAccessRow {
  id: string;
  email: string;
  onboarding_completed: boolean | null;
  website: string | null;
}

interface PulseProjectDomainRow {
  domain: string | null;
}

function isEnablePulseAccessResponse(value: unknown): value is EnablePulseAccessResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.invited === 'boolean' &&
    typeof payload.onboarding_completed === 'boolean' &&
    payload.status === 'enabled'
  );
}

async function enablePulseAccessFallback(userId: string): Promise<EnablePulseAccessResponse> {
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, email, onboarding_completed, website')
    .eq('id', userId)
    .maybeSingle();

  if (userError) {
    throw new Error('No pudimos leer el usuario para habilitar Pulse.');
  }

  const user = userData as PulseUserAccessRow | null;

  if (!user?.id || !user.email) {
    throw new Error('No encontramos el usuario de Pulse.');
  }

  const { data: latestProject, error: latestProjectError } = await supabase
    .from('projects')
    .select('domain')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestProjectError) {
    throw new Error('No pudimos revisar la configuracion del proyecto.');
  }

  const project = latestProject as PulseProjectDomainRow | null;
  const hasConfiguredUrl = Boolean(user.website?.trim() || project?.domain?.trim());

  if (hasConfiguredUrl && !user.onboarding_completed) {
    const { error: updateError } = await supabase
      .from('users')
      .update({
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      throw new Error('No pudimos actualizar el onboarding del usuario.');
    }
  }

  return {
    invited: false,
    onboarding_completed: hasConfiguredUrl ? true : Boolean(user.onboarding_completed),
    status: 'enabled'
  };
}

export async function enablePulseAccess(userId: string): Promise<EnablePulseAccessResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('enable-pulse-access', {
      body: {
        userId
      }
    });

    if (error) {
      return enablePulseAccessFallback(userId);
    }

    if (!isEnablePulseAccessResponse(data)) {
      throw new Error('La respuesta para habilitar Pulse vino incompleta.');
    }

    return data;
  } catch {
    return enablePulseAccessFallback(userId);
  }
}
