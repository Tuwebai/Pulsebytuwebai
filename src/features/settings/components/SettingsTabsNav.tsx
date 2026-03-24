import { Bell, Lock, Monitor, UserCircle2 } from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useReducedMotionPreference } from '@/core/hooks/useReducedMotionPreference';
import { cn } from '@/lib/utils';

const triggerClassName =
  'rounded-[14px] border border-transparent px-3 py-3 text-[13px] font-medium text-[var(--text-secondary)] transition-colors duration-150 data-[state=active]:border-[var(--signal-border)] data-[state=active]:bg-[var(--bg-elevated)] data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-[0_0_0_1px_var(--signal-glow)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]';

const tabs = [
  { value: 'general', label: 'Cuenta', icon: UserCircle2 },
  { value: 'rendimiento', label: 'Experiencia', icon: Monitor },
  { value: 'notificaciones', label: 'Notificaciones', icon: Bell },
  { value: 'seguridad', label: 'Seguridad', icon: Lock },
] as const;

export function SettingsTabsNav() {
  const prefersReducedMotion = useReducedMotionPreference();

  return (
    <TabsList
      className={cn(
        'grid h-auto w-full grid-cols-2 gap-2 rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-2 sm:grid-cols-2 lg:grid-cols-4',
      )}
    >
      {tabs.map(({ value, label, icon: Icon }) => (
        <TabsTrigger
          key={value}
          value={value}
          className={cn(triggerClassName, prefersReducedMotion && 'transition-none hover:bg-transparent')}
          data-tour={`settings-tab-${value}`}
        >
          <span className="flex items-center justify-center gap-2">
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </span>
        </TabsTrigger>
      ))}
    </TabsList>
  );
}
