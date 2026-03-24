import { Lock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { TabsContent } from '@/components/ui/tabs';
import type { Dispatch, SetStateAction } from 'react';
import { SettingsSectionCard } from './SettingsSectionCard';
import type { SecuritySettings } from './settings.types';

interface SecuritySettingsTabProps {
  loading: boolean;
  settings: SecuritySettings;
  setSettings: Dispatch<SetStateAction<SecuritySettings>>;
  onSave: () => Promise<void>;
}

const rowClassName =
  'flex items-center justify-between gap-4 rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-4';
const sliderClassName = 'space-y-2 rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-4';
const labelClassName = 'text-[13px] font-medium text-[var(--text-primary)]';
const hintClassName = 'text-[12px] text-[var(--text-secondary)]';

export function SecuritySettingsTab({
  loading,
  settings,
  setSettings,
  onSave,
}: SecuritySettingsTabProps) {
  return (
    <TabsContent value="seguridad" className="space-y-6">
      <SettingsSectionCard
        icon={<Lock className="h-5 w-5" />}
        title="Seguridad"
        description="Configura las protecciones de acceso que sí tienen sentido para vos como cliente de Pulse."
        tone="danger"
      >
        <div className="space-y-4">
          <div className={rowClassName}>
            <div className="space-y-1">
              <Label className={labelClassName}>Autenticación de dos factores</Label>
              <p className={hintClassName}>Agrega una capa extra de protección al iniciar sesión.</p>
            </div>
            <Switch
              checked={settings.two_factor_auth}
              onCheckedChange={(checked) => setSettings((current) => ({ ...current, two_factor_auth: checked }))}
            />
          </div>

          <div className={sliderClassName}>
            <Label className={labelClassName}>Tiempo de sesión: {settings.session_timeout} minutos</Label>
            <Slider
              value={[settings.session_timeout]}
              onValueChange={(value) =>
                setSettings((current) => ({ ...current, session_timeout: value[0] ?? current.session_timeout }))
              }
              max={120}
              min={15}
              step={15}
            />
            <p className={hintClassName}>Define cuánto tiempo puede quedar abierta tu sesión sin actividad.</p>
          </div>

          {[
            {
              key: 'login_notifications',
              title: 'Notificaciones de login',
              description: 'Recibe avisos cuando se detecta un nuevo ingreso a tu cuenta.',
            },
            {
              key: 'device_management',
              title: 'Gestión de dispositivos',
              description: 'Permite revisar sesiones y dispositivos conectados a tu cuenta.',
            },
          ].map((item) => (
            <div key={item.key} className={rowClassName}>
              <div className="space-y-1">
                <Label className={labelClassName}>{item.title}</Label>
                <p className={hintClassName}>{item.description}</p>
              </div>
              <Switch
                checked={settings[item.key as keyof SecuritySettings] as boolean}
                onCheckedChange={(checked) => setSettings((current) => ({ ...current, [item.key]: checked }))}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end border-t border-[var(--border-subtle)] pt-5">
          <Button
            onClick={onSave}
            disabled={loading}
            className="bg-[var(--signal)] text-white hover:bg-[var(--signal-dim)] shadow-[0_12px_30px_var(--signal-glow)]"
          >
            <Lock className="h-4 w-4" />
            Guardar cambios
          </Button>
        </div>
      </SettingsSectionCard>
    </TabsContent>
  );
}
