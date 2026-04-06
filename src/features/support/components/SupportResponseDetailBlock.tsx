import type { ReactNode } from 'react';
import { cn } from '@/core/utils/cn';

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
        'rounded-[20px] border px-4 py-4 shadow-[var(--support-shadow-card,var(--cliente-shadow-card))]',
        className,
      )}
      style={{
        borderColor: 'var(--support-border-default, var(--cliente-border-default))',
        backgroundColor: 'var(--support-bg-elevated, var(--cliente-bg-elevated))',
      }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--support-text-tertiary,var(--cliente-text-tertiary))]">
        {title}
      </p>
      {value ? <div className="mt-3 text-[var(--support-text-primary,var(--cliente-text-primary))]">{value}</div> : null}
      {description ? (
        <p className="mt-2 text-[13px] leading-5 text-[var(--support-text-secondary,var(--cliente-text-secondary))]">{description}</p>
      ) : null}
      {children ? <div className="mt-3">{children}</div> : null}
    </section>
  );
}
