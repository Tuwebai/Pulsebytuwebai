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
        description="Configura tiempos de sesion, alertas y reglas que protegen tu acceso a Pulse."
        tone="danger"
      >
        <div className="space-y-4">
          <div className={sliderClassName}>
            <Label className={labelClassName}>Tiempo de sesion: {settings.session_timeout} minutos</Label>
            <Slider
              value={[settings.session_timeout]}
              onValueChange={(value) =>
                setSettings((current) => ({ ...current, session_timeout: value[0] ?? current.session_timeout }))
              }
              max={120}
              min={15}
              step={15}
            />
            <p className={hintClassName}>Tiempo antes de cerrar la sesion por inactividad.</p>
          </div>

          <div className={sliderClassName}>
            <Label className={labelClassName}>Intentos maximos de login: {settings.max_login_attempts}</Label>
            <Slider
              value={[settings.max_login_attempts]}
              onValueChange={(value) =>
                setSettings((current) => ({ ...current, max_login_attempts: value[0] ?? current.max_login_attempts }))
              }
              max={10}
              min={3}
              step={1}
            />
            <p className={hintClassName}>Cantidad de intentos antes de bloquear temporalmente la cuenta.</p>
          </div>

          <div className={rowClassName}>
            <div className="space-y-1">
              <Label className={labelClassName}>Cambio obligatorio de contrasena</Label>
              <p className={hintClassName}>Fuerza una renovacion periodica de la clave.</p>
            </div>
            <Switch
              checked={settings.require_password_change}
              onCheckedChange={(checked) => setSettings((current) => ({ ...current, require_password_change: checked }))}
            />
          </div>

          {settings.require_password_change ? (
            <div className="rounded-[18px] border border-[var(--signal-border)] bg-[color:var(--signal-glow)] px-4 py-4">
              <div className="space-y-2">
                <Label className={labelClassName}>Dias antes de expirar: {settings.password_expiry_days}</Label>
                <Slider
                  value={[settings.password_expiry_days]}
                  onValueChange={(value) =>
                    setSettings((current) => ({
                      ...current,
                      password_expiry_days: value[0] ?? current.password_expiry_days,
                    }))
                  }
                  max={365}
                  min={30}
                  step={30}
                />
              </div>
            </div>
          ) : null}

          {[
            { key: 'login_notifications', title: 'Notificaciones de login', description: 'Recibe avisos cuando se detecta un nuevo ingreso.' },
            { key: 'device_management', title: 'Gestion de dispositivos', description: 'Permite revisar sesiones y dispositivos conectados.' },
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
