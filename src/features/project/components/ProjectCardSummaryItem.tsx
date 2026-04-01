interface ProjectCardSummaryItemProps {
  label: string;
  value: string | number;
}

export default function ProjectCardSummaryItem({
  label,
  value,
}: ProjectCardSummaryItemProps) {
  return (
    <div className="rounded-[14px] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-3 py-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)]">{label}</p>
      <p className="mt-2 font-data text-[18px] font-light text-[var(--text-primary)]">{value}</p>
    </div>
  );
}
