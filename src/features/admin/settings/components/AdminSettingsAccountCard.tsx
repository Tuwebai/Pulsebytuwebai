import { Mail, ShieldCheck, Sparkles } from 'lucide-react';

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
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Cuenta operativa
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-50">Identidad del equipo admin</h2>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--signal-border)] bg-[var(--signal-glow)]">
          <Sparkles className="h-4 w-4 text-[var(--signal)]" />
        </div>
      </div>

      <div className="mt-5 flex items-start gap-4">
        <Avatar className="h-14 w-14 border border-[var(--signal-border)]">
          <AvatarImage alt={displayName} className="object-cover" src={displayAvatar} />
          <AvatarFallback className="bg-[var(--bg-elevated)] text-[var(--text-primary)]">
            {getIdentityInitials(displayName, displayEmail)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-[20px] font-medium text-[var(--text-primary)]">{displayName}</h3>
            <Badge className="bg-[var(--signal-glow)] text-[var(--signal)]" variant="default">
              Administrador
            </Badge>
            <Badge className="border-emerald-400/20 bg-emerald-500/10 text-emerald-300" variant="outline">
              Pulse activo
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
            <Mail className="h-4 w-4 text-[var(--signal)]" />
            <span className="truncate">{displayEmail}</span>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-[18px] border border-white/10 bg-[var(--bg-elevated)] px-4 py-3 text-[13px] text-[var(--text-secondary)]">
        Esta cuenta opera el panel interno de Pulse. Acá solo mostramos identidad y referencia admin, sin mezclar datos del cliente.
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[18px] border border-white/10 bg-[var(--bg-elevated)] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Canal principal</p>
          <p className="mt-2 text-sm font-medium text-slate-100">{displayEmail}</p>
        </div>
        <div className="rounded-[18px] border border-white/10 bg-[var(--bg-elevated)] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Contexto</p>
          <p className="mt-2 text-sm font-medium text-slate-100">Operación interna de Pulse</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-[18px] border border-[var(--signal-border)] bg-[var(--signal-glow)] px-4 py-3 text-[13px] text-[var(--text-primary)]">
        <ShieldCheck className="h-4 w-4 text-[var(--signal)]" />
        <span>Superficie admin aislada del perfil cliente.</span>
      </div>
    </section>
  );
}
