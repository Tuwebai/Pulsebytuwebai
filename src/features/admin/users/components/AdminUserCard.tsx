import { useState } from 'react';

import { ChevronDown, Edit, Shield, Trash2, UserCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminUserDomainReviewDialog } from '@/features/admin/components/AdminUserDomainReviewDialog';
import { AdminPulseAccessDialog } from '@/features/admin/users/components/AdminPulseAccessDialog';
import type { PulseAccessActionMode } from '@/features/admin/users/hooks/useAdminUsers';
import type { AdminManagedUser } from '@/features/admin/users/types/adminUser';

interface AdminUserCardWebsiteUpdate {
  website?: string | null;
  website_status?: string | null;
  website_submitted_at?: string | null;
  website_reviewed_at?: string | null;
  website_reviewed_by?: string | null;
  website_review_notes?: string | null;
}

interface AdminUserCardProps {
  user: AdminManagedUser;
  enablingPulseUserId: string | null;
  onRoleChange: (userId: string, newRole: string) => void;
  onPulseAccessAction: (userId: string, mode: PulseAccessActionMode) => void;
  onEdit: (user: AdminManagedUser) => void;
  onDelete: (user: AdminManagedUser) => void;
  onDomainUpdated: (userId: string, update: AdminUserCardWebsiteUpdate) => void;
}

function getWebsiteStatusLabel(status?: string | null, website?: string | null) {
  if (!website) {
    return 'Sin URL';
  }

  switch (status) {
    case 'approved':
      return 'URL aprobada';
    case 'pending_review':
      return 'URL en revision';
    case 'rejected':
      return 'URL rechazada';
    default:
      return 'URL cargada';
  }
}

function getWebsiteStatusBadgeClass(status?: string | null, website?: string | null) {
  if (!website) {
    return 'border-border/60 bg-[var(--bg-elevated)] text-muted-foreground';
  }

  switch (status) {
    case 'approved':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
    case 'pending_review':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
    case 'rejected':
      return 'border-red-500/25 bg-red-500/10 text-red-300';
    default:
      return 'border-border/60 bg-[var(--bg-elevated)] text-foreground';
  }
}

function getWebsiteActionLabel(status?: string | null, website?: string | null) {
  if (!website) {
    return 'Configurar URL';
  }

  switch (status) {
    case 'approved':
      return 'Editar URL';
    case 'pending_review':
      return 'Revisar URL';
    case 'rejected':
      return 'Corregir URL';
    default:
      return 'Gestionar URL';
  }
}

function getPulseAccessLabel(status?: string | null) {
  switch (status) {
    case 'active':
      return 'Acceso Pulse activo';
    case 'invited':
      return 'Invitacion Pulse enviada';
    case 'disabled':
      return 'Acceso Pulse revocado';
    case 'pending':
      return 'Acceso Pulse pendiente';
    default:
      return 'Sin acceso Pulse';
  }
}

function getPulseAccessBadgeClass(status?: string | null) {
  switch (status) {
    case 'active':
      return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
    case 'invited':
      return 'border-signal/30 bg-signal/10 text-signal';
    case 'disabled':
      return 'border-red-500/25 bg-red-500/10 text-red-300';
    case 'pending':
      return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
    default:
      return 'border-border/60 bg-[var(--bg-elevated)] text-muted-foreground';
  }
}

export function AdminUserCard({
  user,
  enablingPulseUserId,
  onRoleChange,
  onPulseAccessAction,
  onEdit,
  onDelete,
  onDomainUpdated,
}: AdminUserCardProps) {
  const [isPulseAccessDialogOpen, setIsPulseAccessDialogOpen] = useState(false);
  const role = user.role || 'cliente';
  const userInitial = user.full_name?.charAt(0) || user.email?.charAt(0) || 'U';
  const isAdmin = role === 'admin';
  const websiteStatusLabel = getWebsiteStatusLabel(user.website_status, user.website);
  const websiteActionLabel = getWebsiteActionLabel(user.website_status, user.website);
  const pulseAccessLabel = getPulseAccessLabel(user.pulse_access_status);
  const pulseAccessEnabled = user.pulse_access_status === 'invited' || user.pulse_access_status === 'active';
  const pulseAccessBusy = enablingPulseUserId === user.id;

  return (
    <div className="rounded-2xl border border-border/60 bg-background/30 p-4 shadow-sm transition-colors duration-150 hover:border-border hover:bg-background/50 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <div className="relative shrink-0">
            {user.avatar_url ? (
              <div className="h-12 w-12 overflow-hidden rounded-2xl border border-white/10 bg-[var(--bg-elevated)] sm:h-14 sm:w-14">
                <img
                  src={user.avatar_url}
                  alt={`Avatar de ${user.full_name || user.email}`}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    const target = event.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement | null;
                    if (fallback) {
                      fallback.style.display = 'flex';
                    }
                  }}
                />
                <div
                  className="hidden h-full w-full items-center justify-center bg-signal/15 text-base font-semibold text-signal"
                  style={{ display: 'none' }}
                >
                  {userInitial}
                </div>
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-signal/15 text-base font-semibold text-signal sm:h-14 sm:w-14">
                {userInitial}
              </div>
            )}

            {isAdmin ? (
              <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-slate-950">
                <Shield className="h-3.5 w-3.5" />
              </div>
            ) : null}
          </div>

          <div className="min-w-0 space-y-2">
            <div className="space-y-1">
              <p className="truncate text-base font-semibold text-foreground sm:text-lg">
                {user.full_name || 'Sin nombre'}
              </p>
              <p className="truncate text-sm text-muted-foreground">{user.email}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={
                  isAdmin
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                    : 'border-border/60 bg-[var(--bg-elevated)] text-foreground'
                }
              >
                {isAdmin ? 'Administrador' : 'Cliente'}
              </Badge>
              {!isAdmin ? (
                <Badge
                  variant="outline"
                  className={getWebsiteStatusBadgeClass(user.website_status, user.website)}
                >
                  {websiteStatusLabel}
                </Badge>
              ) : null}
              {!isAdmin ? (
                <Badge
                  variant="outline"
                  className={getPulseAccessBadgeClass(user.pulse_access_status)}
                >
                  {pulseAccessLabel}
                </Badge>
              ) : null}
              <span className="text-xs text-muted-foreground">ID {user.id.slice(0, 8)}</span>
            </div>

            {!isAdmin ? (
              <p className="max-w-[520px] truncate text-sm text-muted-foreground">
                {user.website ? user.website : 'Todavia no cargamos una URL para este cliente.'}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 lg:w-auto lg:min-w-[360px]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Rol operativo
            </span>
            <Select value={role} onValueChange={(value) => onRoleChange(user.id, value)}>
              <SelectTrigger className="w-full border-border/60 bg-[var(--bg-elevated)] text-foreground sm:w-[180px]">
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
                className="justify-center border-emerald-500/25 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15"
              >
                <UserCheck size={14} className="mr-2" />
                {pulseAccessBusy ? 'Habilitando acceso...' : 'Habilitar acceso Pulse'}
              </Button>
            ) : null}

            {!isAdmin && pulseAccessEnabled ? (
              <div className="flex w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pulseAccessBusy}
                  onClick={() => setIsPulseAccessDialogOpen(true)}
                  className="rounded-r-none justify-center border-signal/30 bg-signal/10 text-signal hover:bg-signal/15"
                >
                  <UserCheck size={14} className="mr-2" />
                  {pulseAccessBusy ? 'Actualizando acceso...' : 'Gestionar acceso'}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pulseAccessBusy}
                      className="rounded-l-none border-l-0 border-signal/30 bg-signal/10 px-2 text-signal hover:bg-signal/15"
                    >
                      <ChevronDown size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[180px]">
                    <DropdownMenuItem
                      onClick={() => onPulseAccessAction(user.id, 'resend')}
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
    </div>
  );
}
