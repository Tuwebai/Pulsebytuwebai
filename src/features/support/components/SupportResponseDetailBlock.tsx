import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SupportResponseDetailBlockProps {
  title: string;
  description?: string;
  value?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export default function SupportResponseDetailBlock({
  title,
  description,
  value,
  className,
  children,
}: SupportResponseDetailBlockProps) {
  return (
    <section
      className={cn(
        'rounded-[20px] border border-white/10 bg-[var(--cliente-bg-elevated)]/70 px-4 py-4 shadow-[var(--cliente-shadow-card)]',
        className,
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--cliente-text-tertiary)]">
        {title}
      </p>
      {value ? <div className="mt-3 text-[var(--cliente-text-primary)]">{value}</div> : null}
      {description ? (
        <p className="mt-2 text-[13px] leading-5 text-[var(--cliente-text-secondary)]">{description}</p>
      ) : null}
      {children ? <div className="mt-3">{children}</div> : null}
    </section>
  );
}
