import { Shield } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { AdminManagedUser } from '@/features/admin/users/types/adminUser';

interface AdminUserCardIdentityProps {
  user: AdminManagedUser;
  isAdmin: boolean;
  userInitial: string;
  displayAvatar?: string;
  websiteStatusLabel: string;
  websiteStatusClassName: string;
  pulseAccessLabel: string;
  pulseAccessClassName: string;
  hasDeletionRequest: boolean;
  websiteSummary: string;
}

export function AdminUserCardIdentity({
  user,
  isAdmin,
  userInitial,
  displayAvatar,
  websiteStatusLabel,
  websiteStatusClassName,
  pulseAccessLabel,
  pulseAccessClassName,
  hasDeletionRequest,
  websiteSummary,
}: AdminUserCardIdentityProps) {
  return (
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
            <Badge variant="outline" className={websiteStatusClassName}>
              {websiteStatusLabel}
            </Badge>
          ) : null}
          {!isAdmin ? (
            <Badge variant="outline" className={pulseAccessClassName}>
              {pulseAccessLabel}
            </Badge>
          ) : null}
          {!isAdmin && hasDeletionRequest ? (
            <Badge variant="outline" className="border-red-400/30 bg-red-500/15 text-red-100">
              Baja solicitada
            </Badge>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {isAdmin ? 'Perfil interno' : 'Dominio Pulse'}
            </p>
            <p className="max-w-[520px] truncate text-[var(--text-primary)]">
              {isAdmin ? 'Usuario de operación interna' : websiteSummary}
            </p>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Identificador
            </p>
            <p className="font-mono text-xs text-[var(--text-secondary)]">{user.id.slice(0, 8)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
