import { useState } from 'react';

import { AdminAccountDeletionDialog } from '@/features/admin/users/components/AdminAccountDeletionDialog';
import { AdminPulseAccessDialog } from '@/features/admin/users/components/AdminPulseAccessDialog';
import { AdminUserCardActions } from '@/features/admin/users/components/AdminUserCardActions';
import { AdminUserCardIdentity } from '@/features/admin/users/components/AdminUserCardIdentity';
import {
  getPulseAccessBadgeClass,
  getPulseAccessLabel,
  getWebsiteActionLabel,
  getWebsiteStatusBadgeClass,
  getWebsiteStatusLabel,
} from '@/features/admin/users/components/adminUserCard.utils';
import type { PulseAccessActionMode } from '@/features/admin/users/hooks/useAdminUsers';
import type { AdminManagedUser } from '@/features/admin/users/types/adminUser';
import { getDisplayAvatar, getIdentityInitials } from '@/lib/identity/userIdentity';

interface AdminUserCardWebsiteUpdate {
  website?: string | null;
  website_status?: string | null;
  website_submitted_at?: string | null;
  website_reviewed_at?: string | null;
  website_reviewed_by?: string | null;
  website_review_notes?: string | null;
  project_ga4_property_id?: string | null;
}

interface AdminUserCardProps {
  user: AdminManagedUser;
  enablingPulseUserId: string | null;
  reviewingDeletionUserId: string | null;
  onRoleChange: (userId: string, newRole: string) => void;
  onPulseAccessAction: (userId: string, mode: PulseAccessActionMode) => void;
  onReviewAccountDeletion: (
    user: AdminManagedUser,
    decision: 'approve' | 'deny',
    note?: string,
  ) => void;
  onEdit: (user: AdminManagedUser) => void;
  onDelete: (user: AdminManagedUser) => void;
  onDomainUpdated: (userId: string, update: AdminUserCardWebsiteUpdate) => void;
}

export function AdminUserCard({
  user,
  enablingPulseUserId,
  reviewingDeletionUserId,
  onRoleChange,
  onPulseAccessAction,
  onReviewAccountDeletion,
  onEdit,
  onDelete,
  onDomainUpdated,
}: AdminUserCardProps) {
  const [isPulseAccessDialogOpen, setIsPulseAccessDialogOpen] = useState(false);
  const [isDeletionDialogOpen, setIsDeletionDialogOpen] = useState(false);

  const role = user.role === 'admin' ? 'admin' : 'cliente';
  const isAdmin = role === 'admin';
  const userInitial = getIdentityInitials(user.full_name, user.email ?? undefined);
  const websiteStatusLabel = getWebsiteStatusLabel(user.website_status, user.website);
  const websiteStatusClassName = getWebsiteStatusBadgeClass(user.website_status, user.website);
  const websiteActionLabel = getWebsiteActionLabel(user.website_status, user.website);
  const pulseAccessLabel = getPulseAccessLabel(user.pulse_access_status);
  const pulseAccessClassName = getPulseAccessBadgeClass(user.pulse_access_status);
  const pulseAccessEnabled = user.pulse_access_status === 'invited' || user.pulse_access_status === 'active';
  const pulseAccessBusy = enablingPulseUserId === user.id;
  const deletionBusy = reviewingDeletionUserId === user.id;
  const hasDeletionRequest = Boolean(user.account_deletion_request_id);
  const websiteSummary = user.website ? user.website : 'Sin dominio operativo cargado';
  const displayAvatar = getDisplayAvatar({}, user);

  return (
    <div className="rounded-[var(--radius-xl)] border border-border/60 bg-[var(--bg-elevated)] p-4 shadow-sm transition-colors duration-150 hover:border-border hover:bg-[var(--bg-elevated)]/90 sm:p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <AdminUserCardIdentity
          user={user}
          isAdmin={isAdmin}
          userInitial={userInitial}
          displayAvatar={displayAvatar}
          websiteStatusLabel={websiteStatusLabel}
          websiteStatusClassName={websiteStatusClassName}
          pulseAccessLabel={pulseAccessLabel}
          pulseAccessClassName={pulseAccessClassName}
          hasDeletionRequest={hasDeletionRequest}
          websiteSummary={websiteSummary}
        />

        <AdminUserCardActions
          user={user}
          role={role}
          isAdmin={isAdmin}
          pulseAccessBusy={pulseAccessBusy}
          pulseAccessEnabled={pulseAccessEnabled}
          hasDeletionRequest={hasDeletionRequest}
          websiteActionLabel={websiteActionLabel}
          onRoleChange={onRoleChange}
          onPulseAccessAction={onPulseAccessAction}
          onEdit={onEdit}
          onDelete={onDelete}
          onOpenPulseAccessDialog={() => setIsPulseAccessDialogOpen(true)}
          onOpenDeletionDialog={() => setIsDeletionDialogOpen(true)}
          onDomainUpdated={onDomainUpdated}
        />
      </div>

      {!isAdmin ? (
        <AdminPulseAccessDialog
          open={isPulseAccessDialogOpen}
          onOpenChange={setIsPulseAccessDialogOpen}
          user={user}
          isBusy={pulseAccessBusy}
          onEnable={() => {
            void onPulseAccessAction(user.id, 'enable');
          }}
          onResend={() => {
            void onPulseAccessAction(user.id, 'resend');
          }}
        />
      ) : null}

      {!isAdmin && hasDeletionRequest ? (
        <AdminAccountDeletionDialog
          open={isDeletionDialogOpen}
          onOpenChange={setIsDeletionDialogOpen}
          user={user}
          isBusy={deletionBusy}
          onApprove={async () => {
            await onReviewAccountDeletion(user, 'approve');
          }}
          onDeny={async (note) => {
            await onReviewAccountDeletion(user, 'deny', note);
          }}
        />
      ) : null}
    </div>
  );
}
