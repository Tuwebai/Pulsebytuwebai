import { Save, Globe } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import type { Dispatch, SetStateAction } from 'react';
import { SettingsSectionCard } from './SettingsSectionCard';
import type { GeneralSettings } from './settings.types';

interface GeneralSettingsTabProps {
  loading: boolean;
  settings: GeneralSettings;
  setSettings: Dispatch<SetStateAction<GeneralSettings>>;
  onSave: () => Promise<void>;
}

const fieldShellClassName = 'space-y-2';
const labelClassName = 'text-[13px] font-medium text-[var(--text-primary)]';
const triggerClassName =
  'border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:border-[var(--border-strong)] focus:border-[var(--signal)] focus:ring-[var(--signal-glow)]';
const contentClassName = 'border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]';
const itemClassName = 'focus:bg-[var(--bg-elevated)] focus:text-[var(--text-primary)]';

export function GeneralSettingsTab({
  loading,
  settings,
  setSettings,
  onSave,
}: GeneralSettingsTabProps) {
  return (
    <TabsContent value="general" className="space-y-6">
      <SettingsSectionCard
        icon={<Globe className="h-5 w-5" />}
        title="Ajustes generales"
        description="Defini el idioma, la zona horaria y el formato en el que queres ver la informacion."
        tone="signal"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className={fieldShellClassName}>
            <Label htmlFor="language" className={labelClassName}>
              Idioma
            </Label>
            <Select value={settings.language} onValueChange={(value) => setSettings((current) => ({ ...current, language: value }))}>
              <SelectTrigger id="language" className={triggerClassName}>
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
            <Label htmlFor="timezone" className={labelClassName}>
              Zona horaria
            </Label>
            <Select value={settings.timezone} onValueChange={(value) => setSettings((current) => ({ ...current, timezone: value }))}>
              <SelectTrigger id="timezone" className={triggerClassName}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={contentClassName}>
                <SelectItem className={itemClassName} value="America/Argentina/Buenos_Aires">
                  Buenos Aires (GMT-3)
                </SelectItem>
                <SelectItem className={itemClassName} value="America/New_York">
                  New York (GMT-5)
                </SelectItem>
                <SelectItem className={itemClassName} value="Europe/Madrid">
                  Madrid (GMT+1)
                </SelectItem>
                <SelectItem className={itemClassName} value="UTC">
                  UTC
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={fieldShellClassName}>
            <Label htmlFor="date_format" className={labelClassName}>
              Formato de fecha
            </Label>
            <Select
              value={settings.date_format}
              onValueChange={(value) => setSettings((current) => ({ ...current, date_format: value }))}
            >
              <SelectTrigger id="date_format" className={triggerClassName}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={contentClassName}>
                <SelectItem className={itemClassName} value="DD/MM/YYYY">
                  DD/MM/YYYY
                </SelectItem>
                <SelectItem className={itemClassName} value="MM/DD/YYYY">
                  MM/DD/YYYY
                </SelectItem>
                <SelectItem className={itemClassName} value="YYYY-MM-DD">
                  YYYY-MM-DD
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={fieldShellClassName}>
            <Label htmlFor="time_format" className={labelClassName}>
              Formato de hora
            </Label>
            <Select
              value={settings.time_format}
              onValueChange={(value) => setSettings((current) => ({ ...current, time_format: value }))}
            >
              <SelectTrigger id="time_format" className={triggerClassName}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={contentClassName}>
                <SelectItem className={itemClassName} value="24h">
                  24 horas
                </SelectItem>
                <SelectItem className={itemClassName} value="12h">
                  12 horas
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end border-t border-[var(--border-subtle)] pt-5">
          <Button
            onClick={onSave}
            disabled={loading}
            className="bg-[var(--signal)] text-white hover:bg-[var(--signal-dim)] shadow-[0_12px_30px_var(--signal-glow)]"
          >
            <Save className="h-4 w-4" />
            Guardar cambios
          </Button>
        </div>
      </SettingsSectionCard>
    </TabsContent>
  );
}
