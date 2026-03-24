import { Globe, Mail, ShieldCheck, UserCircle2 } from 'lucide-react';
import type { User } from '@/contexts/appContext.types';
import { TabsContent } from '@/components/ui/tabs';
import { SettingsSectionCard } from './SettingsSectionCard';

interface GeneralSettingsTabProps {
  user: User;
  projectsCount: number;
}

const itemClassName =
  'rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-4';

export function GeneralSettingsTab({ user, projectsCount }: GeneralSettingsTabProps) {
  const accountItems = [
    {
      icon: <UserCircle2 className="h-4 w-4 text-[var(--signal)]" />,
      label: 'Nombre',
      value: user.full_name || 'Sin definir',
    },
    {
      icon: <Mail className="h-4 w-4 text-[var(--signal)]" />,
      label: 'Email',
      value: user.email,
    },
    {
      icon: <ShieldCheck className="h-4 w-4 text-[var(--signal)]" />,
      label: 'Rol',
      value: user.role === 'admin' ? 'Administrador' : 'Cliente',
    },
    {
      icon: <Globe className="h-4 w-4 text-[var(--signal)]" />,
      label: 'Sitio web',
      value: user.website || 'Se configura durante onboarding o junto al equipo',
    },
  ];

  return (
    <TabsContent value="general" className="space-y-6">
      <SettingsSectionCard
        icon={<UserCircle2 className="h-5 w-5" />}
        title="Cuenta"
        description="Consulta la informacion principal de tu cuenta y el estado general con el que usas Pulse."
        tone="signal"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {accountItems.map((item) => (
            <div key={item.label} className={itemClassName}>
              <div className="mb-3 flex items-center gap-2 text-[12px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                {item.icon}
                <span>{item.label}</span>
              </div>
              <p className="text-[14px] text-[var(--text-primary)]">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-[18px] border border-[var(--signal-border)] bg-[color:var(--signal-glow)] px-4 py-4">
          <p className="text-[13px] text-[var(--text-primary)]">
            Tu cuenta tiene <span className="font-medium">{projectsCount}</span> proyecto{projectsCount === 1 ? '' : 's'} asociado{projectsCount === 1 ? '' : 's'}.
          </p>
          <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
            Los datos base de perfil y los cambios administrativos se gestionan junto al equipo de TuWebAI para evitar configuraciones innecesarias dentro de Pulse.
          </p>
        </div>
      </SettingsSectionCard>
    </TabsContent>
  );
}
