interface AdminPaymentsStatsProps {
  totalPayments: number;
  approvedTotalLabel: string;
  pendingPayments: number;
}

export function AdminPaymentsStats({
  totalPayments,
  approvedTotalLabel,
  pendingPayments,
}: AdminPaymentsStatsProps) {
  const stats = [
    {
      label: 'Movimientos',
      value: String(totalPayments),
      hint: 'base operativa',
    },
    {
      label: 'Acreditado',
      value: approvedTotalLabel,
      hint: 'solo aprobados',
    },
    {
      label: 'Pendientes',
      value: String(pendingPayments),
      hint: 'requieren seguimiento',
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-3 lg:grid-cols-3">
      {stats.map((stat) => (
        <article
          key={stat.label}
          className="rounded-[22px] border border-white/10 bg-[var(--bg-surface)]/92 px-4 py-4 shadow-[0_14px_30px_rgba(2,6,23,0.22)]"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {stat.label}
          </p>
          <p className="mt-3 break-words font-data text-3xl leading-none text-slate-50">
            {stat.value}
          </p>
          <p className="mt-2 text-xs text-slate-400">{stat.hint}</p>
        </article>
      ))}
    </section>
  );
}
