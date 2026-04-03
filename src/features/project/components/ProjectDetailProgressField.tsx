interface ProjectDetailProgressFieldProps {
  progress: number;
}

export default function ProjectDetailProgressField({
  progress,
}: ProjectDetailProgressFieldProps) {
  return (
    <section className="rounded-[20px] border border-white/10 bg-[var(--cliente-bg-elevated)] px-4 py-3 shadow-[var(--cliente-shadow-card)]">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--cliente-text-tertiary)]">
          Avance general
        </p>
        <p className="text-[12px] text-[var(--cliente-text-secondary)]">del trabajo total</p>
      </div>
      <div className="mt-3 flex items-center justify-between gap-4">
        <p className="font-data text-[28px] font-light leading-none text-[var(--cliente-text-primary)]">
          {progress}%
        </p>
      </div>
      <div className="mt-4 h-1.5 rounded-full bg-[var(--cliente-bg-subtle)]">
        <div
          className="h-1.5 rounded-full bg-[var(--cliente-signal)] transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-3 text-[12px] leading-5 text-[var(--cliente-text-secondary)]">
        Esto te da una lectura simple de cuánto ya quedó resuelto.
      </p>
    </section>
  );
}
