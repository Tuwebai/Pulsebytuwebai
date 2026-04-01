import { Mail, ShieldCheck } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useApp } from '@/contexts/AppContext';
import { useProfile } from '@/features/profile/hooks/useProfile';
import {
  getDisplayAvatar,
  getDisplayEmail,
  getDisplayName,
  getIdentityInitials,
} from '@/lib/identity/userIdentity';

export function AdminSettingsAccountCard() {
  const { user } = useApp();
  const { profile } = useProfile();
  const displayName = getDisplayName(profile, user, 'Operador Pulse');
  const displayEmail = getDisplayEmail(profile, user);
  const displayAvatar = getDisplayAvatar(profile, user);

  return (
    <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/92 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.24)]">
      <div className="flex items-start gap-4">
        <Avatar className="h-14 w-14 border border-[var(--signal-border)]">
          <AvatarImage alt={displayName} className="object-cover" src={displayAvatar} />
          <AvatarFallback className="bg-[var(--bg-elevated)] text-[var(--text-primary)]">
            {getIdentityInitials(displayName, displayEmail)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-xl font-semibold text-[var(--text-primary)]">{displayName}</h2>
            <Badge className="bg-[var(--signal-glow)] text-[var(--signal)]" variant="default">
              Administrador
            </Badge>
          </div>

          <div className="mt-2 flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
            <Mail className="h-4 w-4 text-[var(--signal)]" />
            <span className="truncate">{displayEmail}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[18px] border border-white/10 bg-[var(--bg-elevated)] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Superficie</p>
          <p className="mt-2 text-sm font-medium text-slate-100">Panel interno de Pulse</p>
        </div>

        <div className="rounded-[18px] border border-white/10 bg-[var(--bg-elevated)] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Canal principal</p>
          <p className="mt-2 truncate text-sm font-medium text-slate-100">{displayEmail}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-[18px] border border-[var(--signal-border)] bg-[var(--signal-glow)] px-4 py-3 text-[13px] text-[var(--text-primary)]">
        <ShieldCheck className="h-4 w-4 text-[var(--signal)]" />
        <span>La identidad admin se mantiene separada de la experiencia cliente.</span>
      </div>
    </section>
  );
}
