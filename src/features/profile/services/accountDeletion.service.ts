import {
  fetchAccountDeletionRequest as fetchAccountDeletionRequestApi,
  requestAccountDeletion as requestAccountDeletionApi,
} from '@/api/profile/accountDeletion.api';
import type { AccountDeletionRequestSnapshot } from '@/features/profile/types/accountDeletion';

export async function getAccountDeletionRequest(userId: string): Promise<AccountDeletionRequestSnapshot> {
  return fetchAccountDeletionRequestApi(userId);
}

export async function submitAccountDeletionRequest(reason: string): Promise<AccountDeletionRequestSnapshot> {
  const normalizedReason = reason.trim();

  if (normalizedReason.length < 10) {
    throw new Error('Contanos brevemente por qué querés dar de baja la cuenta.');
  }

  if (normalizedReason.length > 600) {
    throw new Error('El motivo es demasiado largo. Intentá resumirlo en pocas líneas.');
  }

  return requestAccountDeletionApi(normalizedReason);
}
