import { DollarSign, FolderOpen, Ticket, Users } from 'lucide-react';

interface AdminOverviewStatsProps {
  usuariosActivos: number;
  usuariosNuevos: number;
  crecimientoUsuarios: number;
  proyectosTotales: number;
  proyectosNuevos: number;
  ticketsAbiertos: number;
  ticketsUrgentes: number;
  ticketsEnProgreso: number;
  ingresosTotales: number;
  ingresosEsteMes: number;
}

export function AdminOverviewStats({
  usuariosActivos,
  usuariosNuevos,
  crecimientoUsuarios,
  proyectosTotales,
  proyectosNuevos,
  ticketsAbiertos,
  ticketsUrgentes,
  ticketsEnProgreso,
  ingresosTotales,
  ingresosEsteMes,
}: AdminOverviewStatsProps) {
  const cards = [
    {
      icon: Users,
      value: usuariosActivos.toLocaleString('es-AR'),
      label: 'Clientes activos',
      detail: `+${usuariosNuevos} altas (${crecimientoUsuarios}%)`,
      iconClassName: 'bg-signal/15 text-signal',
      detailClassName: 'text-emerald-400',
      valueClassName: 'text-[clamp(2.4rem,4vw,3.4rem)]',
    },
    {
      icon: FolderOpen,
      value: proyectosTotales.toLocaleString('es-AR'),
      label: 'Proyectos bajo seguimiento',
      detail: `+${proyectosNuevos} ingresados este mes`,
      iconClassName: 'bg-emerald-500/15 text-emerald-400',
      detailClassName: 'text-emerald-400',
      valueClassName: 'text-[clamp(2.4rem,4vw,3.4rem)]',
    },
    {
      icon: Ticket,
      value: ticketsAbiertos.toLocaleString('es-AR'),
      label: 'Soporte operativo',
      detail: `${ticketsUrgentes} urgentes, ${ticketsEnProgreso} en curso`,
      iconClassName: 'bg-amber-500/15 text-amber-400',
      detailClassName: ticketsUrgentes > 0 ? 'text-amber-300' : 'text-slate-400',
      valueClassName: 'text-[clamp(2.4rem,4vw,3.4rem)]',
    },
    {
      icon: DollarSign,
      value: `$${ingresosTotales.toLocaleString('es-AR')}`,
      label: 'Cobranza administrada',
      detail: `$${ingresosEsteMes.toLocaleString('es-AR')} este mes`,
      iconClassName: 'bg-violet-500/15 text-violet-300',
      detailClassName: 'text-emerald-400',
      valueClassName: 'text-[clamp(1.9rem,3vw,3rem)]',
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <section
            key={card.label}
            className="min-w-0 rounded-[24px] border border-white/10 bg-[var(--bg-surface)]/92 p-4 shadow-[0_18px_40px_rgba(2,6,23,0.24)] transition-colors hover:border-white/15 sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${card.iconClassName}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Resumen
              </p>
            </div>

            <div className="mt-4 min-w-0 space-y-1.5">
              <p className="text-sm font-medium text-slate-100">{card.label}</p>
              <p
                className={`min-w-0 overflow-hidden text-ellipsis font-data font-light leading-none tracking-tight text-slate-50 ${card.valueClassName}`}
              >
                {card.value}
              </p>
              <p className={`text-xs leading-5 ${card.detailClassName}`}>{card.detail}</p>
            </div>
          </section>
        );
      })}
    </div>
  );
}
