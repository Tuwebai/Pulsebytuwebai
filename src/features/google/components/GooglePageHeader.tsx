import { Badge } from '@/core/components';
import type { BadgeProps } from '@/core/components/Badge';

interface GooglePageHeaderProps {
  badgeLabel: string;
  badgeVariant: BadgeProps['variant'];
  domain: string | null;
  googleAccountEmail?: string | null;
}

export default function GooglePageHeader({
  badgeLabel,
  badgeVariant,
  domain,
  googleAccountEmail,
}: GooglePageHeaderProps) {
  return (
    <section
      className="overflow-hidden rounded-[var(--cliente-card-radius)] border px-[var(--cliente-card-padding-mobile)] py-[var(--cliente-card-padding-mobile)] shadow-[var(--cliente-card-shadow)] md:px-[var(--cliente-card-padding)] md:py-[var(--cliente-card-padding)]"
      style={{
        background: 'var(--cliente-hero-bg)',
        borderColor: 'var(--cliente-hero-border)',
      }}
    >
      <div className="mb-4 h-px w-full" style={{ background: 'var(--cliente-hero-line)' }} />

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <Badge size="sm" variant={badgeVariant}>
            {badgeLabel}
          </Badge>
          <div>
            <h1 className="text-[22px] font-medium text-[var(--text-primary)]">Tu web en Google</h1>
            <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[var(--text-secondary)]">
              Acá vas a ver cómo te encuentran, qué páginas ganan visibilidad y dónde hay oportunidades para crecer.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[var(--bg-surface)]/75 px-4 py-3 text-sm text-[var(--text-secondary)]">
          <span className="block text-[11px] uppercase tracking-[0.14em] text-[var(--text-tertiary)]">Sitio actual</span>
          <span className="mt-1 block font-medium text-[var(--text-primary)]">{domain ?? 'Todavía no cargaste tu web'}</span>
          {googleAccountEmail ? (
            <span className="mt-2 block text-[13px] text-[var(--text-secondary)]">Conectado con {googleAccountEmail}</span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
