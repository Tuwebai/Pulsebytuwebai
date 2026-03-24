import { Monitor } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
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
        title="Experiencia"
        description="Ajusta solo preferencias visuales y de uso que realmente impactan tu experiencia dentro de Pulse."
        tone="signal"
      >
        <div className="space-y-4">
          {[
            {
              key: 'animations_enabled',
              title: 'Animaciones',
              description: 'Activa transiciones suaves para que la interfaz se sienta más viva.',
            },
            {
              key: 'low_bandwidth_mode',
              title: 'Modo de bajo ancho de banda',
              description: 'Reduce carga visual y consumo para conexiones lentas o inestables.',
            },
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
