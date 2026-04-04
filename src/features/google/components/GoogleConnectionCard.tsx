interface GoogleConnectionCardProps {
  actionLabel: string;
  description: string;
  onAction: () => void;
  title: string;
}

export default function GoogleConnectionCard({
  actionLabel,
  description,
  onAction,
  title,
}: GoogleConnectionCardProps) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/92 p-5 shadow-[0_18px_40px_rgba(2,6,23,0.24)] sm:p-6">
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Conexión</p>
        <h2 className="mt-3 text-[22px] font-medium text-[var(--text-primary)]">{title}</h2>
        <p className="mt-3 text-[14px] leading-6 text-[var(--text-secondary)]">{description}</p>
      </div>

      <button
        className="mt-6 inline-flex items-center justify-center rounded-full bg-[var(--signal)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--signal-dim)]"
        onClick={onAction}
        type="button"
      >
        {actionLabel}
      </button>
    </section>
  );
}

