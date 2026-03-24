import { AlertTriangle, BriefcaseBusiness, Shield, UserRound } from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useReducedMotionPreference } from '@/core/hooks/useReducedMotionPreference';
import { PROFILE_TABS } from '@/features/profile/constants/profile.constants';
import { cn } from '@/lib/utils';

const PROFILE_TAB_ICONS = {
  datos: UserRound,
  negocio: BriefcaseBusiness,
  seguridad: Shield,
  cuenta: AlertTriangle,
} as const;

const triggerClassName =
  'rounded-[16px] border border-transparent px-3 py-3 text-[13px] font-medium text-[var(--text-secondary)] transition-colors duration-150 data-[state=active]:border-[var(--signal-border)] data-[state=active]:bg-[var(--bg-elevated)] data-[state=active]:text-[var(--text-primary)] data-[state=active]:shadow-[0_0_0_1px_var(--signal-glow)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]';

export function ProfileTabsNav() {
  const prefersReducedMotion = useReducedMotionPreference();

  return (
    <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-[20px] border border-[var(--border-default)] bg-[var(--bg-surface)] p-2 lg:grid-cols-4">
      {PROFILE_TABS.map(({ value, label }) => {
        const Icon = PROFILE_TAB_ICONS[value];

        return (
          <TabsTrigger
            key={value}
            value={value}
            className={cn(triggerClassName, prefersReducedMotion && 'transition-none hover:bg-transparent')}
            data-tour={`profile-tab-${value}`}
          >
            <span className="flex items-center justify-center gap-2">
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </span>
          </TabsTrigger>
        );
      })}
    </TabsList>
  );
}
