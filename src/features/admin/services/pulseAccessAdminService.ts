import {
  invokeEnablePulseAccess,
  type EnablePulseAccessResponse,
} from '@/api/admin/pulseAccess.api';

export type { EnablePulseAccessResponse };

export async function enablePulseAccess(userId: string): Promise<EnablePulseAccessResponse> {
  return invokeEnablePulseAccess(userId);
}
