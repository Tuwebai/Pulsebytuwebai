import { Globe, Mail, ShieldCheck, UserCircle2 } from 'lucide-react';
import type { User } from '@/contexts/appContext.types';
import { TabsContent } from '@/components/ui/tabs';
import AccentIcon from '@/core/components/AccentIcon';
import { SettingsSectionCard } from './SettingsSectionCard';

interface GeneralSettingsTabProps {
  user: User;
  projectsCount: number;
}

const detailCardClassName =
  'rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-4';

export function GeneralSettingsTab({ user, projectsCount }: GeneralSettingsTabProps) {
  const accountDetails = [
    {
      icon: <ShieldCheck className="h-4 w-4" />,
      label: 'Rol de acceso',
      value: user.role === 'admin' ? 'Administrador' : 'Cliente',
      tone: 'signal' as const,
    },
    {
      icon: <Globe className="h-4 w-4" />,
      label: 'Sitio web',
      value: user.website || 'Se configura durante onboarding o junto al equipo',
      tone: 'default' as const,
    },
  ];

  return (
    <TabsContent value="general" className="space-y-6" data-tour="settings-panel-general">
      <SettingsSectionCard
        icon={<UserCircle2 className="h-5 w-5" />}
        title="Cuenta"
        description="Revisá la identidad principal con la que usás Pulse y el estado general de tu acceso."
        tone="signal"
      >
        <div className="rounded-[20px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-5 py-5" data-tour="settings-general-overview">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 space-y-2">
              <div className="flex items-center gap-3">
                <AccentIcon tone="signal">
                  <UserCircle2 className="h-4 w-4" />
                </AccentIcon>
                <div className="min-w-0">
                  <p className="truncate text-[18px] font-medium text-[var(--text-primary)]">
                    {user.full_name || 'Sin definir'}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
                    <Mail className="h-4 w-4 text-[var(--signal)]" />
                    <span className="truncate">{user.email}</span>
                  </div>
                </div>
              </div>
              <p className="max-w-2xl text-[13px] leading-6 text-[var(--text-secondary)]">
                Tu identidad principal y los datos estructurales de la cuenta se administran junto al
                equipo de TuWebAI para mantener Pulse simple y enfocado en el seguimiento de tu web.
              </p>
            </div>

            <div className="rounded-[18px] border border-[var(--signal-border)] bg-[color:var(--signal-glow)] px-4 py-3 md:min-w-[220px]">
              <p className="text-[11px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                Estado de cuenta
              </p>
              <p className="mt-2 text-[22px] font-medium text-[var(--text-primary)]">
                {projectsCount} proyecto{projectsCount === 1 ? '' : 's'}
              </p>
              <p className="mt-1 text-[12px] text-[var(--text-secondary)]">
                asociado{projectsCount === 1 ? '' : 's'} a tu acceso actual en Pulse.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {accountDetails.map((item) => (
            <div key={item.label} className={detailCardClassName}>
              <div className="mb-3 flex items-center gap-3">
                <AccentIcon tone={item.tone}>{item.icon}</AccentIcon>
                <div className="min-w-0">
                  <p className="text-[12px] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                    {item.label}
                  </p>
                  <p className="mt-1 text-[14px] text-[var(--text-primary)]">{item.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SettingsSectionCard>
    </TabsContent>
  );
}
