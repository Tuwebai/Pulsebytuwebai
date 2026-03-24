import { Monitor } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { TabsContent } from '@/components/ui/tabs';
import { useReducedMotionPreference } from '@/core/hooks/useReducedMotionPreference';
import type { Dispatch, SetStateAction } from 'react';
import { SettingsSectionCard } from './SettingsSectionCard';
import { SettingsSaveActions } from './SettingsSaveActions';
import type { PerformanceSettings } from './settings.types';

interface PerformanceSettingsTabProps {
  dirty: boolean;
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
  dirty,
  loading,
  settings,
  setSettings,
  onSave,
}: PerformanceSettingsTabProps) {
  const prefersReducedMotion = useReducedMotionPreference();

  return (
    <TabsContent value="rendimiento" className="space-y-6" data-tour="settings-panel-rendimiento">
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
                className={prefersReducedMotion ? 'transition-none' : undefined}
                checked={settings[item.key as keyof PerformanceSettings] as boolean}
                onCheckedChange={(checked) => setSettings((current) => ({ ...current, [item.key]: checked }))}
              />
            </div>
          ))}
        </div>

        <SettingsSaveActions dirty={dirty} loading={loading} onSave={onSave} />
      </SettingsSectionCard>
    </TabsContent>
  );
}
