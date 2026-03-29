export type AccountDeletionRequestState = 'none' | 'pending' | 'denied';

export interface AccountDeletionRequestSnapshot {
  id: string;
  state: AccountDeletionRequestState;
  requestedAt: string | null;
  reason: string | null;
  response: string | null;
}
