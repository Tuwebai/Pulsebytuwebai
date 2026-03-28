import { ShieldAlert } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface AdminProjectTrackingContextBannerProps {
  ctaLabel: string;
  description: string;
  onOpenEdit: () => void;
}

export function AdminProjectTrackingContextBanner({
  ctaLabel,
  description,
  onOpenEdit,
}: AdminProjectTrackingContextBannerProps) {
  return (
    <section className="rounded-[24px] border border-amber-400/15 bg-amber-500/10 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/10 text-amber-300">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-amber-200/80">
              Contexto de alerta
            </p>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Llegaste desde alertas Pulse</h2>
            <p className="max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
          </div>
        </div>

        <Button
          type="button"
          onClick={onOpenEdit}
          className="rounded-xl border border-signal/20 bg-signal text-white hover:bg-signal/90"
        >
          {ctaLabel}
        </Button>
      </div>
    </section>
  );
}
