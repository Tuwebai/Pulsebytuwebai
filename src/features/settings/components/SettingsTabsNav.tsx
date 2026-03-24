import { Bell, Cog, Globe, Lock, Monitor, Shield } from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { SettingsTabValue } from './settings.types';

interface SettingsTabsNavProps {
  isAdmin: boolean;
}

const triggerClassName =
  'rounded-[14px] border border-transparent px-3 py-3 text-[13px] font-medium text-[var(--text-secondary)] transition-colors duration-150 data-[state=active]:border-[var(--signal-border)] data-[state=active]:bg-[var(--bg-elevated)] data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-[0_0_0_1px_var(--signal-glow)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]';

const tabs = [
  { value: 'general', label: 'General', icon: Globe },
  { value: 'privacidad', label: 'Privacidad', icon: Shield },
  { value: 'rendimiento', label: 'Rendimiento', icon: Monitor },
  { value: 'notificaciones', label: 'Notificaciones', icon: Bell },
  { value: 'seguridad', label: 'Seguridad', icon: Lock },
] satisfies Array<{
  value: Exclude<SettingsTabValue, 'admin'>;
  label: string;
  icon: typeof Globe;
}>;

export function SettingsTabsNav({ isAdmin }: SettingsTabsNavProps) {
  return (
    <TabsList
      className={cn(
        'grid h-auto w-full gap-2 rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-2',
        isAdmin ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
      )}
    >
      {tabs.map(({ value, label, icon: Icon }) => (
        <TabsTrigger key={value} value={value} className={triggerClassName}>
          <span className="flex items-center justify-center gap-2">
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </span>
        </TabsTrigger>
      ))}
      {isAdmin ? (
        <TabsTrigger value="admin" className={triggerClassName}>
          <span className="flex items-center justify-center gap-2">
            <Cog className="h-4 w-4" />
            <span>Admin</span>
          </span>
        </TabsTrigger>
      ) : null}
    </TabsList>
  );
}
