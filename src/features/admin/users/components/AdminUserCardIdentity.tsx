import { Shield } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/core/ui/avatar';
import { Badge } from '@/core/ui/badge';
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
    <div className="flex min-w-0 flex-1 items-start gap-3">
      <div className="relative shrink-0">
        <Avatar className="h-12 w-12 rounded-2xl border border-white/10 bg-[var(--bg-elevated)] ring-0">
          <AvatarImage alt={`Avatar de ${user.full_name || user.email}`} className="object-cover" src={displayAvatar} />
          <AvatarFallback className="rounded-2xl bg-sky-500/15 text-sm font-semibold text-sky-200">
            {userInitial}
          </AvatarFallback>
        </Avatar>

        {isAdmin ? (
          <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-slate-950">
            <Shield className="h-3 w-3" />
          </div>
        ) : null}
      </div>

      <div className="min-w-0 flex-1 space-y-3">
        <div className="space-y-1">
          <p className="truncate text-base font-semibold text-slate-50">{user.full_name || 'Sin nombre'}</p>
          <p className="truncate text-sm text-slate-400">{user.email}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={
              isAdmin
                ? 'border-amber-400/25 bg-amber-500/10 text-amber-100'
                : 'border-white/10 bg-white/[0.04] text-slate-100'
            }
          >
            {isAdmin ? 'Administrador' : 'Cliente'}
          </Badge>
          {!isAdmin ? <Badge variant="outline" className={websiteStatusClassName}>{websiteStatusLabel}</Badge> : null}
          {!isAdmin ? <Badge variant="outline" className={pulseAccessClassName}>{pulseAccessLabel}</Badge> : null}
          {!isAdmin && hasDeletionRequest ? (
            <Badge variant="outline" className="border-red-400/25 bg-red-500/10 text-red-100">
              Baja solicitada
            </Badge>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
          <div className="min-w-0">
            <p className="font-semibold uppercase tracking-[0.16em] text-slate-500">
              {isAdmin ? 'Perfil' : 'Dominio'}
            </p>
            <p className="max-w-[360px] truncate text-slate-300">
              {isAdmin ? 'Operación interna' : websiteSummary}
            </p>
          </div>
          <div className="min-w-0">
            <p className="font-semibold uppercase tracking-[0.16em] text-slate-500">ID</p>
            <p className="font-mono text-slate-300">{user.id.slice(0, 8)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
