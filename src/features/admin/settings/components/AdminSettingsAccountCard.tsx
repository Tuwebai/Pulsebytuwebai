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
    <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.2)]">
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16 border border-[var(--signal-border)]">
          <AvatarImage alt={displayName} className="object-cover" src={displayAvatar} />
          <AvatarFallback className="bg-[var(--bg-elevated)] text-[var(--text-primary)]">
            {getIdentityInitials(displayName, displayEmail)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-[20px] font-medium text-[var(--text-primary)]">{displayName}</h2>
            <Badge className="bg-[var(--signal-glow)] text-[var(--signal)]" variant="default">
              Administrador
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
            <Mail className="h-4 w-4 text-[var(--signal)]" />
            <span className="truncate">{displayEmail}</span>
          </div>

          <div className="rounded-[18px] border border-white/10 bg-[var(--bg-elevated)] px-4 py-3 text-[13px] text-[var(--text-secondary)]">
            Tu cuenta opera el panel de Pulse. Desde acá solo mostramos identidad y referencia interna, sin mezclar
            formularios de cliente ni datos de negocio.
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-[18px] border border-[var(--signal-border)] bg-[var(--signal-glow)] px-4 py-3 text-[13px] text-[var(--text-primary)]">
        <ShieldCheck className="h-4 w-4 text-[var(--signal)]" />
        <span>Superficie admin aislada del perfil cliente.</span>
      </div>
    </section>
  );
}
