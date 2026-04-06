import { ChevronDown, Edit, Trash2, UserCheck } from 'lucide-react';

import { Button } from '@/core/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/core/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/ui/select';
import { AdminUserDomainReviewDialog } from '@/features/admin/components/AdminUserDomainReviewDialog';
import type { PulseAccessActionMode } from '@/features/admin/users/hooks/useAdminUsers';
import type { AdminManagedUser } from '@/features/admin/users/types/adminUser';

interface AdminUserCardActionsProps {
  user: AdminManagedUser;
  role: 'admin' | 'cliente';
  isAdmin: boolean;
  pulseAccessBusy: boolean;
  pulseAccessEnabled: boolean;
  hasDeletionRequest: boolean;
  websiteActionLabel: string;
  onRoleChange: (userId: string, newRole: string) => void;
  onPulseAccessAction: (userId: string, mode: PulseAccessActionMode) => void;
  onEdit: (user: AdminManagedUser) => void;
  onDelete: (user: AdminManagedUser) => void;
  onOpenPulseAccessDialog: () => void;
  onOpenDeletionDialog: () => void;
  onDomainUpdated: (
    userId: string,
    result: {
      website?: string | null;
      website_status?: string | null;
      website_submitted_at?: string | null;
      website_reviewed_at?: string | null;
      website_reviewed_by?: string | null;
      website_review_notes?: string | null;
      project_ga4_property_id?: string | null;
    },
  ) => void;
}

export function AdminUserCardActions({
  user,
  role,
  isAdmin,
  pulseAccessBusy,
  pulseAccessEnabled,
  hasDeletionRequest,
  websiteActionLabel,
  onRoleChange,
  onPulseAccessAction,
  onEdit,
  onDelete,
  onOpenPulseAccessDialog,
  onOpenDeletionDialog,
  onDomainUpdated,
}: AdminUserCardActionsProps) {
  return (
    <div className="flex flex-col gap-3 xl:items-end">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Rol</span>
        <Select value={role} onValueChange={(value) => onRoleChange(user.id, value)}>
          <SelectTrigger className="h-9 w-[148px] border-white/10 bg-[var(--bg-base)] text-slate-100">
            <SelectValue>{isAdmin ? 'Admin' : 'Cliente'}</SelectValue>
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-[var(--bg-elevated)] text-slate-100">
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="cliente">Cliente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2 xl:justify-end">
        {!isAdmin && !pulseAccessEnabled ? (
          <Button
            variant="outline"
            size="sm"
            disabled={pulseAccessBusy}
            onClick={() => onPulseAccessAction(user.id, 'enable')}
            className="h-9 justify-center border-emerald-500/25 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20"
          >
            <UserCheck size={14} className="mr-2" />
            {pulseAccessBusy ? 'Habilitando...' : 'Habilitar acceso'}
          </Button>
        ) : null}

        {!isAdmin && pulseAccessEnabled ? (
          <div className="flex overflow-hidden rounded-xl border border-sky-400/20 bg-sky-500/10">
            <Button
              variant="ghost"
              size="sm"
              disabled={pulseAccessBusy}
              onClick={onOpenPulseAccessDialog}
              className="h-9 rounded-none bg-transparent px-3 text-sky-100 hover:bg-sky-500/15"
            >
              <UserCheck size={14} className="mr-2" />
              {pulseAccessBusy ? 'Actualizando...' : 'Gestionar acceso'}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pulseAccessBusy}
                  className="h-9 rounded-none border-l border-sky-400/20 bg-transparent px-2 text-sky-100 hover:bg-sky-500/15"
                >
                  <ChevronDown size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[200px] rounded-xl border-white/10 bg-[var(--bg-elevated)] p-1 text-slate-100 shadow-[0_18px_40px_rgba(2,6,23,0.32)]">
                <DropdownMenuItem
                  onClick={() => onPulseAccessAction(user.id, 'resend')}
                  className="rounded-lg px-3 py-2 text-sm focus:bg-sky-500/10 focus:text-sky-100"
                >
                  Reenviar acceso
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : null}

        {!isAdmin ? (
          <AdminUserDomainReviewDialog
            user={user}
            triggerLabel={websiteActionLabel}
            onUpdated={(result) => {
              onDomainUpdated(user.id, result);
            }}
          />
        ) : null}

        {!isAdmin && hasDeletionRequest ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenDeletionDialog}
            className="h-9 justify-center border-red-500/25 bg-red-500/10 text-red-100 hover:bg-red-500/20"
          >
            Revisar baja
          </Button>
        ) : null}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(user)}
          className="h-9 justify-center border-white/10 bg-transparent text-slate-200 hover:bg-slate-900"
        >
          <Edit size={14} className="mr-2" />
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(user)}
          className="h-9 justify-center border-red-500/25 bg-red-500/10 text-red-100 hover:bg-red-500/20"
        >
          <Trash2 size={14} className="mr-2" />
          Eliminar
        </Button>
      </div>
    </div>
  );
}
