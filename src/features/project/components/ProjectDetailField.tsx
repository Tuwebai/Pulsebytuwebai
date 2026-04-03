import type { ReactNode } from 'react';

interface ProjectDetailFieldProps {
  className?: string;
  description?: string;
  label: string;
  value: ReactNode;
}

export default function ProjectDetailField({
  className,
  description,
  label,
  value,
}: ProjectDetailFieldProps) {
  return (
    <section className={`rounded-[20px] border border-white/10 bg-[var(--cliente-bg-elevated)] px-4 py-3 shadow-[var(--cliente-shadow-card)] ${className ?? ''}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--cliente-text-tertiary)]">
        {label}
      </p>
      <div className="mt-3 text-sm font-medium leading-6 text-[var(--cliente-text-primary)]">{value}</div>
      {description ? (
        <p className="mt-3 text-[12px] leading-5 text-[var(--cliente-text-secondary)]">{description}</p>
      ) : null}
    </section>
  );
}
