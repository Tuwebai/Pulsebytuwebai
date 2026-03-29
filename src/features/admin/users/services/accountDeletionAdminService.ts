import {
  reviewAccountDeletionRequest,
  type AccountDeletionDecision,
} from '@/api/admin/accountDeletionRequests.api';

export async function reviewAdminAccountDeletionRequest(params: {
  requestId: string;
  decision: AccountDeletionDecision;
  note?: string;
}) {
  const note = params.note?.trim();

  if (params.decision === 'deny' && !note) {
    throw new Error('Sumá una explicación breve para que el cliente entienda la decisión.');
  }

  return reviewAccountDeletionRequest({
    requestId: params.requestId,
    decision: params.decision,
    note,
  });
}
