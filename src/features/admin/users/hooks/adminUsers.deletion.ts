import type { Dispatch, SetStateAction } from 'react';

import { toast } from '@/hooks/use-toast';
import { getDeletionReviewSuccessToast } from '@/features/admin/users/hooks/adminUsers.feedback';
import { reviewAdminAccountDeletionRequest } from '@/features/admin/users/services/accountDeletionAdminService';
import type { AdminManagedUser } from '@/features/admin/users/types/adminUser';

export async function reviewAdminUserDeletion(
  user: AdminManagedUser,
  decision: 'approve' | 'deny',
  setUsers: Dispatch<SetStateAction<AdminManagedUser[]>>,
  note?: string,
) {
  if (!user.account_deletion_request_id) {
    throw new Error('La solicitud de baja ya no está disponible.');
  }

  await reviewAdminAccountDeletionRequest({
    requestId: user.account_deletion_request_id,
    decision,
    note,
  });

  if (decision === 'approve') {
    setUsers((prev) => prev.filter((currentUser) => currentUser.id !== user.id));
    toast(getDeletionReviewSuccessToast(decision));
    return;
  }

  setUsers((prev) =>
    prev.map((currentUser) =>
      currentUser.id === user.id
        ? {
            ...currentUser,
            account_deletion_request_id: null,
            account_deletion_requested_at: null,
            account_deletion_reason: null,
          }
        : currentUser,
    ),
  );

  toast(getDeletionReviewSuccessToast(decision));
}
