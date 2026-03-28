import { useState } from 'react';

import { ChevronDown, Edit, Shield, Trash2, UserCheck } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdminUserDomainReviewDialog } from '@/features/admin/components/AdminUserDomainReviewDialog';
import { AdminPulseAccessDialog } from '@/features/admin/users/components/AdminPulseAccessDialog';
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
    return 'border-white/10 bg-white/[0.06] text-slate-200';
  }

  switch (status) {
    case 'approved':
      return 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100';
    case 'pending_review':
      return 'border-amber-400/30 bg-amber-500/15 text-amber-100';
    case 'rejected':
      return 'border-red-400/30 bg-red-500/15 text-red-100';
    default:
      return 'border-slate-400/20 bg-slate-400/10 text-slate-100';
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
      return 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100';
    case 'invited':
      return 'border-sky-400/30 bg-sky-500/15 text-sky-100';
    case 'disabled':
      return 'border-red-400/30 bg-red-500/15 text-red-100';
    case 'pending':
      return 'border-amber-400/30 bg-amber-500/15 text-amber-100';
    default:
      return 'border-white/10 bg-white/[0.06] text-slate-200';
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
  const role = user.role === 'admin' ? 'admin' : 'cliente';
  const userInitial = getIdentityInitials(user.full_name, user.email ?? undefined);
  const isAdmin = role === 'admin';
  const websiteStatusLabel = getWebsiteStatusLabel(user.website_status, user.website);
  const websiteActionLabel = getWebsiteActionLabel(user.website_status, user.website);
  const pulseAccessLabel = getPulseAccessLabel(user.pulse_access_status);
  const pulseAccessEnabled = user.pulse_access_status === 'invited' || user.pulse_access_status === 'active';
  const pulseAccessBusy = enablingPulseUserId === user.id;
  const websiteSummary = user.website ? user.website : 'Sin dominio operativo cargado';
  const displayAvatar = getDisplayAvatar(undefined, user);

  return (
    <div className="rounded-[var(--radius-xl)] border border-border/60 bg-[var(--bg-elevated)] p-4 shadow-sm transition-colors duration-150 hover:border-border hover:bg-[var(--bg-elevated)]/90 sm:p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <div className="relative shrink-0">
            <Avatar className="h-12 w-12 rounded-2xl border border-white/10 bg-[var(--bg-elevated)] ring-0 sm:h-14 sm:w-14">
              <AvatarImage
                alt={`Avatar de ${user.full_name || user.email}`}
                className="object-cover"
                src={displayAvatar}
              />
              <AvatarFallback className="rounded-2xl bg-signal/15 text-base font-semibold text-signal">
                {userInitial}
              </AvatarFallback>
            </Avatar>

            {isAdmin ? (
              <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-slate-950">
                <Shield className="h-3.5 w-3.5" />
              </div>
            ) : null}
          </div>

          <div className="min-w-0 space-y-3">
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
                    ? 'border-amber-400/30 bg-amber-500/15 text-amber-100'
                    : 'border-white/10 bg-white/[0.06] text-slate-100'
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
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  {isAdmin ? 'Perfil interno' : 'Dominio Pulse'}
                </p>
                <p className="max-w-[520px] truncate text-[var(--text-primary)]">
                  {isAdmin ? 'Usuario de operacion interna' : websiteSummary}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Identificador
                </p>
                <p className="font-mono text-xs text-[var(--text-secondary)]">
                  {user.id.slice(0, 8)}
                </p>
              </div>
            </div>
          </div>
        </div>

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
                  onClick={() => setIsPulseAccessDialogOpen(true)}
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
