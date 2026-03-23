import { supabase } from '@/lib/supabase/supabase';

interface EnablePulseAccessResponse {
  invited: boolean;
  onboarding_completed: boolean;
  status: 'enabled';
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

export async function enablePulseAccess(userId: string): Promise<EnablePulseAccessResponse> {
  const { data, error } = await supabase.functions.invoke('enable-pulse-access', {
    body: {
      userId
    }
  });

  if (error) {
    throw new Error('No pudimos habilitar el acceso a Pulse.');
  }

  if (!isEnablePulseAccessResponse(data)) {
    throw new Error('La respuesta para habilitar Pulse vino incompleta.');
  }

  return data;
}
