import { Cog } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { TabsContent } from '@/components/ui/tabs';
import type { Dispatch, SetStateAction } from 'react';
import { SettingsSectionCard } from './SettingsSectionCard';
import type { SystemSettings } from './settings.types';

interface AdminSettingsTabProps {
  loading: boolean;
  settings: SystemSettings;
  setSettings: Dispatch<SetStateAction<SystemSettings>>;
  onSave: () => Promise<void>;
}

const fieldShellClassName = 'space-y-2';
const labelClassName = 'text-[13px] font-medium text-[var(--text-primary)]';
const hintClassName = 'text-[12px] text-[var(--text-secondary)]';
const inputClassName =
  'border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] hover:border-[var(--border-strong)] focus-visible:border-[var(--signal)] focus-visible:ring-[var(--signal-glow)]';
const triggerClassName =
  'border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:border-[var(--border-strong)] focus:border-[var(--signal)] focus:ring-[var(--signal-glow)]';
const contentClassName = 'border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]';
const itemClassName = 'focus:bg-[var(--bg-elevated)] focus:text-[var(--text-primary)]';
const rowClassName =
  'flex items-center justify-between gap-4 rounded-[18px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-4';

export function AdminSettingsTab({
  loading,
  settings,
  setSettings,
  onSave,
}: AdminSettingsTabProps) {
  return (
    <TabsContent value="admin" className="space-y-6">
      <SettingsSectionCard
        icon={<Cog className="h-5 w-5" />}
        title="Administracion del sistema"
        description="Configuraciones avanzadas reservadas para administradores de Pulse."
        tone="warning"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className={fieldShellClassName}>
            <Label className={labelClassName}>Nombre del sistema</Label>
            <Input
              value={settings.system_name}
              onChange={(event) => setSettings((current) => ({ ...current, system_name: event.target.value }))}
              className={inputClassName}
              placeholder="Nombre del sistema"
            />
          </div>

          <div className={fieldShellClassName}>
            <Label className={labelClassName}>Zona horaria del sistema</Label>
            <Select
              value={settings.system_timezone}
              onValueChange={(value) => setSettings((current) => ({ ...current, system_timezone: value }))}
            >
              <SelectTrigger className={triggerClassName}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={contentClassName}>
                <SelectItem className={itemClassName} value="UTC">
                  UTC
                </SelectItem>
                <SelectItem className={itemClassName} value="America/Argentina/Buenos_Aires">
                  Argentina (GMT-3)
                </SelectItem>
                <SelectItem className={itemClassName} value="America/New_York">
                  Nueva York (GMT-5)
                </SelectItem>
                <SelectItem className={itemClassName} value="Europe/Madrid">
                  Madrid (GMT+1)
                </SelectItem>
                <SelectItem className={itemClassName} value="Asia/Tokyo">
                  Tokio (GMT+9)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={fieldShellClassName}>
            <Label className={labelClassName}>Idioma del sistema</Label>
            <Select
              value={settings.system_language}
              onValueChange={(value) => setSettings((current) => ({ ...current, system_language: value }))}
            >
              <SelectTrigger className={triggerClassName}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={contentClassName}>
                <SelectItem className={itemClassName} value="es">
                  Espanol
                </SelectItem>
                <SelectItem className={itemClassName} value="en">
                  English
                </SelectItem>
                <SelectItem className={itemClassName} value="pt">
                  Portugues
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={fieldShellClassName}>
            <Label className={labelClassName}>Nivel de log</Label>
            <Select value={settings.log_level} onValueChange={(value) => setSettings((current) => ({ ...current, log_level: value }))}>
              <SelectTrigger className={triggerClassName}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={contentClassName}>
                <SelectItem className={itemClassName} value="error">
                  Error
                </SelectItem>
                <SelectItem className={itemClassName} value="warn">
                  Warning
                </SelectItem>
                <SelectItem className={itemClassName} value="info">
                  Info
                </SelectItem>
                <SelectItem className={itemClassName} value="debug">
                  Debug
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-[18px] border border-[var(--warning-dim)] bg-[color:var(--warning-dim)] px-4 py-4">
            <div className="space-y-1">
              <Label className={labelClassName}>Modo de mantenimiento</Label>
              <p className={hintClassName}>Bloquea el acceso al sistema mientras se realizan tareas internas.</p>
            </div>
            <Switch
              checked={settings.maintenance_mode}
              onCheckedChange={(checked) => setSettings((current) => ({ ...current, maintenance_mode: checked }))}
            />
          </div>

          {[
            { key: 'debug_mode', title: 'Modo debug', description: 'Expone informacion adicional para diagnostico interno.' },
            { key: 'auto_updates', title: 'Actualizaciones automaticas', description: 'Permite desplegar mejoras del sistema sin intervencion manual.' },
          ].map((item) => (
            <div key={item.key} className={rowClassName}>
              <div className="space-y-1">
                <Label className={labelClassName}>{item.title}</Label>
                <p className={hintClassName}>{item.description}</p>
              </div>
              <Switch
                checked={settings[item.key as keyof SystemSettings] as boolean}
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
            <Cog className="h-4 w-4" />
            Guardar configuracion del sistema
          </Button>
        </div>
      </SettingsSectionCard>
    </TabsContent>
  );
}
