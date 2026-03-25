import { Lock } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { TabsContent } from '@/components/ui/tabs';
import { useReducedMotionPreference } from '@/core/hooks/useReducedMotionPreference';
import { SettingsSaveActions } from './SettingsSaveActions';
import { SettingsSectionCard } from './SettingsSectionCard';
import type { SecuritySettings } from './settings.types';

interface SecuritySettingsTabProps {
  dirty: boolean;
  loading: boolean;
  settings: SecuritySettings;
  setSettings: Dispatch<SetStateAction<SecuritySettings>>;
  onSave: () => Promise<void>;
}

const sliderClassName = 'space-y-2 rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-4';
const noteClassName =
  'rounded-[18px] border border-[var(--warning)] bg-[var(--warning-dim)] px-4 py-4 text-[13px] leading-6 text-[var(--text-primary)]';
const labelClassName = 'text-[13px] font-medium text-[var(--text-primary)]';
const hintClassName = 'text-[12px] text-[var(--text-secondary)]';

export function SecuritySettingsTab({
  dirty,
  loading,
  settings,
  setSettings,
  onSave,
}: SecuritySettingsTabProps) {
  const prefersReducedMotion = useReducedMotionPreference();

  return (
    <TabsContent value="seguridad" className="space-y-6" data-tour="settings-panel-seguridad">
      <SettingsSectionCard
        icon={<Lock className="h-5 w-5" />}
        title="Seguridad"
        description="Controlá el tiempo de sesión que querés mantener abierto en este dispositivo. Las protecciones avanzadas de acceso se administran en el login y con el equipo de TuWebAI."
        tone="danger"
      >
        <div className="space-y-4" data-tour="settings-security-controls">
          <div className={sliderClassName}>
            <Label className={labelClassName}>Tiempo de sesión: {settings.session_timeout} minutos</Label>
            <Slider
              className={prefersReducedMotion ? 'transition-none' : undefined}
              value={[settings.session_timeout]}
              onValueChange={(value) =>
                setSettings((current) => ({ ...current, session_timeout: value[0] ?? current.session_timeout }))
              }
              max={120}
              min={15}
              step={15}
            />
            <p className={hintClassName}>Si no detectamos actividad dentro de Pulse, la sesión se cerrará automáticamente.</p>
          </div>

          <div className={noteClassName}>
            Controles como 2FA, alertas de login y gestión de dispositivos no se muestran acá hasta tener enforcement real
            en autenticación. Preferimos no prometer una protección que hoy todavía no existe de punta a punta.
          </div>
        </div>

        <SettingsSaveActions dirty={dirty} loading={loading} onSave={onSave} />
      </SettingsSectionCard>
    </TabsContent>
  );
}
