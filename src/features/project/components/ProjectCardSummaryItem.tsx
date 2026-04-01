interface ProjectCardSummaryItemProps {
  label: string;
  value: string | number;
}

export default function ProjectCardSummaryItem({
  label,
  value,
}: ProjectCardSummaryItemProps) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-[var(--bg-base)]/70 px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 font-data text-[18px] font-light text-slate-50">{value}</p>
    </div>
  );
}
