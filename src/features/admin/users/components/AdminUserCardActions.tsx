import { ChevronDown, Edit, Trash2, UserCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    <div className="flex w-full flex-col gap-3 border-t border-[var(--border-subtle)] pt-4 lg:w-auto lg:min-w-[360px] lg:border-t-0 lg:pt-0">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
        <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Rol operativo
        </span>
        <Select value={role} onValueChange={(value) => onRoleChange(user.id, value)}>
          <SelectTrigger className="w-full border-border/60 bg-background/30 text-foreground sm:w-[180px]">
            <SelectValue>{isAdmin ? 'Admin' : 'Cliente'}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin" className="text-card-foreground">
              Admin
            </SelectItem>
            <SelectItem value="cliente" className="text-card-foreground">
              Cliente
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {!isAdmin && !pulseAccessEnabled ? (
          <Button
            variant="outline"
            size="sm"
            disabled={pulseAccessBusy}
            onClick={() => onPulseAccessAction(user.id, 'enable')}
            className="justify-center rounded-xl border-emerald-500/25 bg-emerald-500/10 text-emerald-300 shadow-sm hover:bg-emerald-500/15"
          >
            <UserCheck size={14} className="mr-2" />
            {pulseAccessBusy ? 'Habilitando acceso...' : 'Habilitar acceso Pulse'}
          </Button>
        ) : null}

        {!isAdmin && pulseAccessEnabled ? (
          <div className="flex w-full overflow-hidden rounded-xl border border-signal/25 bg-signal/10 shadow-sm sm:w-auto">
            <Button
              variant="ghost"
              size="sm"
              disabled={pulseAccessBusy}
              onClick={onOpenPulseAccessDialog}
              className="h-9 flex-1 justify-between rounded-none bg-transparent px-3 text-signal hover:bg-signal/15 sm:min-w-[190px]"
            >
              <span className="inline-flex items-center gap-2">
                <UserCheck size={14} />
                {pulseAccessBusy ? 'Actualizando acceso...' : 'Gestionar acceso'}
              </span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pulseAccessBusy}
                  className="h-9 rounded-none border-l border-signal/20 bg-transparent px-3 text-signal hover:bg-signal/15"
                >
                  <ChevronDown size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="min-w-[220px] rounded-xl border-border/60 bg-[var(--bg-elevated)] p-1 text-foreground shadow-[var(--shadow-elevated)]"
              >
                <DropdownMenuItem
                  onClick={() => onPulseAccessAction(user.id, 'resend')}
                  className="rounded-lg px-3 py-2 text-sm focus:bg-signal/10 focus:text-signal"
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
            className="justify-center border-red-500/25 bg-red-500/10 text-red-300 hover:bg-red-500/15"
          >
            Revisar baja
          </Button>
        ) : null}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(user)}
          className="justify-center border-border/60 bg-[var(--bg-elevated)] text-foreground hover:border-signal/40"
        >
          <Edit size={14} className="mr-2" />
          Editar
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(user)}
          className="justify-center border-red-500/25 bg-red-500/10 text-red-300 hover:bg-red-500/15"
        >
          <Trash2 size={14} className="mr-2" />
          Eliminar
        </Button>
      </div>
    </div>
  );
}
