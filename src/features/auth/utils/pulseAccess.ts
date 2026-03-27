export type PulseAccessStatus = 'pending' | 'invited' | 'active' | 'disabled' | null | undefined;

export function hasPulseAccess(status: PulseAccessStatus): boolean {
  return status === 'invited' || status === 'active';
}

export function isPulseAccessDisabled(status: PulseAccessStatus): boolean {
  return status === 'disabled';
}
