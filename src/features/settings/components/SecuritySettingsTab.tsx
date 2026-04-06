import { Lock } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import { TabsContent } from '@/core/ui/tabs';
import { SettingsSectionCard } from './SettingsSectionCard';
import type { SecuritySettings } from './settings.types';

interface SecuritySettingsTabProps {
  dirty: boolean;
  loading: boolean;
  settings: SecuritySettings;
  setSettings: Dispatch<SetStateAction<SecuritySettings>>;
  onSave: () => Promise<void>;
}

const infoCardClassName =
  'space-y-3 rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-4';
const noteClassName =
  'rounded-[18px] border border-[var(--warning)] bg-[var(--warning-dim)] px-4 py-4 text-[13px] leading-6 text-[var(--text-primary)]';
const titleClassName = 'text-[13px] font-medium text-[var(--text-primary)]';
const hintClassName = 'text-[13px] leading-6 text-[var(--text-secondary)]';

export function SecuritySettingsTab(props: SecuritySettingsTabProps) {
  void props;

  return (
    <TabsContent value="seguridad" className="space-y-6" data-tour="settings-panel-seguridad">
      <SettingsSectionCard
        icon={<Lock className="h-5 w-5" />}
        title="Seguridad"
        description="Tu sesión queda disponible en este dispositivo hasta que decidas cerrarla. Si usás un equipo compartido, salí manualmente cuando termines."
        tone="danger"
      >
        <div className="space-y-4" data-tour="settings-security-controls">
          <div className={infoCardClassName}>
            <p className={titleClassName}>Sesión activa en este dispositivo</p>
            <p className={hintClassName}>
              Pulse conserva tu acceso para que puedas volver sin encontrarte con cierres automáticos por
              inactividad.
            </p>
          </div>

          <div className={noteClassName}>
            Las protecciones avanzadas de acceso, como verificación extra o control de dispositivos, se administran
            desde el login y con el equipo de TuWebAI. Preferimos mostrar acá solo lo que hoy funciona de punta a
            punta.
          </div>
        </div>
      </SettingsSectionCard>
    </TabsContent>
  );
}
