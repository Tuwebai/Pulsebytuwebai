import { Monitor } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { TabsContent } from '@/components/ui/tabs';
import type { Dispatch, SetStateAction } from 'react';
import { SettingsSectionCard } from './SettingsSectionCard';
import type { PerformanceSettings } from './settings.types';

interface PerformanceSettingsTabProps {
  loading: boolean;
  settings: PerformanceSettings;
  setSettings: Dispatch<SetStateAction<PerformanceSettings>>;
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

export function PerformanceSettingsTab({
  loading,
  settings,
  setSettings,
  onSave,
}: PerformanceSettingsTabProps) {
  return (
    <TabsContent value="rendimiento" className="space-y-6">
      <SettingsSectionCard
        icon={<Monitor className="h-5 w-5" />}
        title="Rendimiento"
        description="Ajusta como se comporta la interfaz segun tu conexion, velocidad y preferencia visual."
        tone="signal"
      >
        <div className="space-y-4">
          <div className={rowClassName}>
            <div className="space-y-1">
              <Label className={labelClassName}>Guardado automatico</Label>
              <p className={hintClassName}>Guarda tus cambios mientras avanzas sin tener que confirmar cada vez.</p>
            </div>
            <Switch
              checked={settings.auto_save}
              onCheckedChange={(checked) => setSettings((current) => ({ ...current, auto_save: checked }))}
            />
          </div>

          {settings.auto_save ? (
            <div className="rounded-[18px] border border-[var(--signal-border)] bg-[color:var(--signal-glow)] px-4 py-4">
              <div className="space-y-2">
                <Label className={labelClassName}>Intervalo de guardado: {settings.auto_save_interval} segundos</Label>
                <Slider
                  value={[settings.auto_save_interval]}
                  onValueChange={(value) =>
                    setSettings((current) => ({ ...current, auto_save_interval: value[0] ?? current.auto_save_interval }))
                  }
                  max={120}
                  min={10}
                  step={10}
                />
              </div>
            </div>
          ) : null}

          <div className={rowClassName}>
            <div className="space-y-1">
              <Label className={labelClassName}>Cache habilitado</Label>
              <p className={hintClassName}>Mejora la velocidad de carga en visitas repetidas.</p>
            </div>
            <Switch
              checked={settings.cache_enabled}
              onCheckedChange={(checked) => setSettings((current) => ({ ...current, cache_enabled: checked }))}
            />
          </div>

          <div className={rowClassName}>
            <div className="space-y-1">
              <Label className={labelClassName}>Calidad de imagen</Label>
              <p className={hintClassName}>Balancea nitidez visual y velocidad de carga.</p>
            </div>
            <Select
              value={settings.image_quality}
              onValueChange={(value) => setSettings((current) => ({ ...current, image_quality: value }))}
            >
              <SelectTrigger className={triggerClassName}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className={contentClassName}>
                <SelectItem className={itemClassName} value="low">
                  Baja
                </SelectItem>
                <SelectItem className={itemClassName} value="medium">
                  Media
                </SelectItem>
                <SelectItem className={itemClassName} value="high">
                  Alta
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {[
            { key: 'animations_enabled', title: 'Animaciones', description: 'Activa transiciones y movimiento en la interfaz.' },
            { key: 'low_bandwidth_mode', title: 'Modo de bajo ancho de banda', description: 'Reduce carga visual para conexiones lentas o inestables.' },
          ].map((item) => (
            <div key={item.key} className={rowClassName}>
              <div className="space-y-1">
                <Label className={labelClassName}>{item.title}</Label>
                <p className={hintClassName}>{item.description}</p>
              </div>
              <Switch
                checked={settings[item.key as keyof PerformanceSettings] as boolean}
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
            <Monitor className="h-4 w-4" />
            Guardar cambios
          </Button>
        </div>
      </SettingsSectionCard>
    </TabsContent>
  );
}
