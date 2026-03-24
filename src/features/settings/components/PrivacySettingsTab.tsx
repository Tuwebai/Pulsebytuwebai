import { Shield } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { TabsContent } from '@/components/ui/tabs';
import type { Dispatch, SetStateAction } from 'react';
import { SettingsSectionCard } from './SettingsSectionCard';
import type { PrivacySettings } from './settings.types';

interface PrivacySettingsTabProps {
  loading: boolean;
  settings: PrivacySettings;
  setSettings: Dispatch<SetStateAction<PrivacySettings>>;
  onSave: () => Promise<void>;
}

const rowClassName =
  'flex items-center justify-between gap-4 rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-4';
const labelClassName = 'text-[13px] font-medium text-[var(--text-primary)]';
const hintClassName = 'text-[12px] text-[var(--text-secondary)]';
const triggerClassName =
  'w-[132px] border-[var(--border-default)] bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:border-[var(--border-strong)] focus:border-[var(--signal)] focus:ring-[var(--signal-glow)]';
const contentClassName = 'border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]';
const itemClassName = 'focus:bg-[var(--bg-elevated)] focus:text-[var(--text-primary)]';

export function PrivacySettingsTab({
  loading,
  settings,
  setSettings,
  onSave,
}: PrivacySettingsTabProps) {
  return (
    <TabsContent value="privacidad" className="space-y-6">
      <SettingsSectionCard
        icon={<Shield className="h-5 w-5" />}
        title="Privacidad"
        description="Controla que informacion compartis y que permisos extra queres habilitar en tu cuenta."
        tone="success"
      >
        <div className="space-y-4">
          <div className={rowClassName}>
            <div className="space-y-1">
              <Label className={labelClassName}>Visibilidad del perfil</Label>
              <p className={hintClassName}>Define quien puede ver tu informacion dentro de la plataforma.</p>
            </div>
            <Select
              value={settings.profile_visibility}
              onValueChange={(value) => setSettings((current) => ({ ...current, profile_visibility: value }))}
            >
              <SelectTrigger className={triggerClassName}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={contentClassName}>
                <SelectItem className={itemClassName} value="public">
                  Publico
                </SelectItem>
                <SelectItem className={itemClassName} value="friends">
                  Amigos
                </SelectItem>
                <SelectItem className={itemClassName} value="private">
                  Privado
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {[
            { key: 'show_email', title: 'Mostrar email', description: 'Permite que otros usuarios vean tu correo en contextos compartidos.' },
            { key: 'show_phone', title: 'Mostrar telefono', description: 'Permite que otros usuarios vean tu numero de contacto.' },
            { key: 'allow_cookies', title: 'Analisis y cookies', description: 'Ayuda a mejorar la experiencia y el rendimiento de Pulse.' },
            { key: 'two_factor_auth', title: 'Autenticacion de dos factores', description: 'Suma una capa extra de seguridad para ingresar a tu cuenta.' },
          ].map((item) => (
            <div key={item.key} className={rowClassName}>
              <div className="space-y-1">
                <Label className={labelClassName}>{item.title}</Label>
                <p className={hintClassName}>{item.description}</p>
              </div>
              <Switch
                checked={settings[item.key as keyof PrivacySettings] as boolean}
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
            <Shield className="h-4 w-4" />
            Guardar cambios
          </Button>
        </div>
      </SettingsSectionCard>
    </TabsContent>
  );
}
