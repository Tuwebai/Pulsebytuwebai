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
  const ingresosTotalesLabel = `$${ingresosTotales.toLocaleString()}`;
  const ingresosEsteMesLabel = `$${ingresosEsteMes.toLocaleString()}`;
  const cards = [
    {
      icon: Users,
      value: usuariosActivos,
      label: 'Clientes Pulse activos',
      detail: `+${usuariosNuevos} altas del mes (${crecimientoUsuarios}%)`,
      iconClassName: 'bg-signal/15 text-signal',
      detailClassName: 'text-emerald-400',
    },
    {
      icon: FolderOpen,
      value: proyectosTotales,
      label: 'Proyectos bajo seguimiento',
      detail: `+${proyectosNuevos} ingresados este mes`,
      iconClassName: 'bg-emerald-500/15 text-emerald-400',
      detailClassName: 'text-emerald-400',
    },
    {
      icon: Ticket,
      value: ticketsAbiertos,
      label: 'Soporte operativo',
      detail: `${ticketsUrgentes} urgentes, ${ticketsEnProgreso} en curso`,
      iconClassName: 'bg-amber-500/15 text-amber-400',
      detailClassName: ticketsUrgentes > 0 ? 'text-amber-300' : 'text-muted-foreground',
    },
    {
      icon: DollarSign,
      value: ingresosTotalesLabel,
      label: 'Cobranza administrada',
      detail: `${ingresosEsteMesLabel} registrados este mes`,
      iconClassName: 'bg-violet-500/15 text-violet-300',
      detailClassName: 'text-emerald-400',
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <section
            key={card.label}
            className="rounded-2xl border border-border/60 bg-[var(--bg-surface)] p-4 shadow-sm transition-colors duration-150 hover:border-border sm:p-5"
          >
            <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${card.iconClassName}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="font-data text-4xl font-light tracking-tight text-foreground">
              {card.value}
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {card.label}
            </p>
            <p className={`mt-1 text-xs ${card.detailClassName}`}>
              {card.detail}
            </p>
          </section>
        );
      })}
    </div>
  );
}
