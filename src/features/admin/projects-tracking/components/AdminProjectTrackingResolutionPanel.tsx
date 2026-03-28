import { CalendarClock, UserRound } from 'lucide-react';

import { Button } from '@/components/ui/button';

export interface AdminProjectTrackingResolutionAction {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  icon: 'owner' | 'date';
  disabled?: boolean;
  onClick: () => void;
}

interface AdminProjectTrackingResolutionPanelProps {
  actions: AdminProjectTrackingResolutionAction[];
}

const iconMap = {
  owner: UserRound,
  date: CalendarClock,
} as const;

const accentMap = {
  owner: 'border-sky-400/15 bg-sky-500/10 text-sky-200',
  date: 'border-amber-400/15 bg-amber-500/10 text-amber-200',
} as const;

export function AdminProjectTrackingResolutionPanel({
  actions,
}: AdminProjectTrackingResolutionPanelProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
          Resolución operativa
        </p>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Acciones sugeridas por Pulse</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {actions.map((action) => {
          const AccentIcon = iconMap[action.icon];

          return (
            <article
              key={action.id}
              className={`rounded-[24px] border p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)] ${accentMap[action.icon]}`}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/10">
                    <AccentIcon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-[var(--text-primary)]">{action.title}</h3>
                    <p className="text-sm leading-6 text-[var(--text-secondary)]">{action.description}</p>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className="rounded-xl border border-signal/20 bg-signal text-white hover:bg-signal/90"
                >
                  {action.ctaLabel}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
