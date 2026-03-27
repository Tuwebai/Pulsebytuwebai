import {
  invokeEnablePulseAccess,
  type EnablePulseAccessResponse,
} from '@/api/admin/pulseAccess.api';

export type { EnablePulseAccessResponse };

export async function enablePulseAccess(
  userId: string,
  action: 'enable' | 'resend' = 'enable',
): Promise<EnablePulseAccessResponse> {
  return invokeEnablePulseAccess(userId, action);
}
