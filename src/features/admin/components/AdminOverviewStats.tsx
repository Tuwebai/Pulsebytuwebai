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

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-6">
      <div className="relative group cursor-pointer">
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card bg-gradient-to-br from-primary/5 via-primary/10 to-primary/15 p-3 shadow-lg transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl dark:border-slate-700/20 dark:bg-slate-800/50 dark:from-blue-500/10 dark:via-blue-500/5 dark:to-indigo-500/10 sm:rounded-2xl sm:p-4 lg:p-6">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg transition-transform duration-300 group-hover:scale-110 sm:mb-3 sm:h-12 sm:w-12 sm:rounded-2xl lg:mb-4 lg:h-14 lg:w-14">
            <Users size={20} className="sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
          </div>
          <div className="mb-1 text-xl font-bold text-card-foreground transition-transform duration-300 group-hover:scale-105 sm:mb-2 sm:text-2xl lg:text-3xl xl:text-4xl">
            {usuariosActivos}
          </div>
          <div className="mb-1 text-xs font-semibold text-muted-foreground sm:text-sm lg:text-lg">
            <span className="hidden sm:inline">Clientes Pulse activos</span>
            <span className="sm:hidden">Clientes</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground sm:text-sm">
            <span className="font-semibold text-green-600 dark:text-green-400">+{usuariosNuevos}</span>
            <span className="hidden sm:inline">altas del mes ({crecimientoUsuarios}%)</span>
            <span className="sm:hidden">({crecimientoUsuarios}%)</span>
          </div>
          <div className="absolute inset-0 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-1000 group-hover:translate-x-full group-hover:opacity-100" />
        </div>
      </div>

      <div className="relative group cursor-pointer">
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card bg-gradient-to-br from-emerald-500/5 via-emerald-500/10 to-teal-500/15 p-3 shadow-lg transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl dark:border-slate-700/20 dark:bg-slate-800/50 dark:from-emerald-500/10 dark:via-emerald-500/5 dark:to-teal-500/10 sm:rounded-2xl sm:p-4 lg:p-6">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg transition-transform duration-300 group-hover:scale-110 sm:mb-3 sm:h-12 sm:w-12 sm:rounded-2xl lg:mb-4 lg:h-14 lg:w-14">
            <FolderOpen size={20} className="sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
          </div>
          <div className="mb-1 text-xl font-bold text-card-foreground transition-transform duration-300 group-hover:scale-105 sm:mb-2 sm:text-2xl lg:text-3xl xl:text-4xl">
            {proyectosTotales}
          </div>
          <div className="mb-1 text-xs font-semibold text-muted-foreground sm:text-sm lg:text-lg">
            <span className="hidden sm:inline">Proyectos bajo seguimiento</span>
            <span className="sm:hidden">Proyectos</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground sm:text-sm">
            <span className="font-semibold text-green-600 dark:text-green-400">+{proyectosNuevos}</span>
            <span className="hidden sm:inline">ingresados este mes</span>
          </div>
          <div className="absolute inset-0 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-1000 group-hover:translate-x-full group-hover:opacity-100" />
        </div>
      </div>

      <div className="relative group cursor-pointer">
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card bg-gradient-to-br from-amber-500/5 via-amber-500/10 to-orange-500/15 p-3 shadow-lg transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl dark:border-slate-700/20 dark:bg-slate-800/50 dark:from-amber-500/10 dark:via-amber-500/5 dark:to-orange-500/10 sm:rounded-2xl sm:p-4 lg:p-6">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg transition-transform duration-300 group-hover:scale-110 sm:mb-3 sm:h-12 sm:w-12 sm:rounded-2xl lg:mb-4 lg:h-14 lg:w-14">
            <Ticket size={20} className="sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
          </div>
          <div className="mb-1 text-xl font-bold text-card-foreground transition-transform duration-300 group-hover:scale-105 sm:mb-2 sm:text-2xl lg:text-3xl xl:text-4xl">
            {ticketsAbiertos}
          </div>
          <div className="mb-1 text-xs font-semibold text-muted-foreground sm:text-sm lg:text-lg">
            <span className="hidden sm:inline">Soporte operativo</span>
            <span className="sm:hidden">Tickets</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground sm:text-sm">
            <span className="font-semibold text-red-600 dark:text-red-400">{ticketsUrgentes}</span>
            <span className="hidden sm:inline">urgentes, </span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">{ticketsEnProgreso}</span>
            <span className="hidden sm:inline">en curso</span>
          </div>
          <div className="absolute inset-0 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-1000 group-hover:translate-x-full group-hover:opacity-100" />
        </div>
      </div>

      <div className="relative group cursor-pointer">
        <div className="overflow-hidden rounded-xl border border-border/50 bg-card bg-gradient-to-br from-violet-500/5 via-violet-500/10 to-purple-500/15 p-3 shadow-lg transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl dark:border-slate-700/20 dark:bg-slate-800/50 dark:from-violet-500/10 dark:via-violet-500/5 dark:to-purple-500/10 sm:rounded-2xl sm:p-4 lg:p-6">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg transition-transform duration-300 group-hover:scale-110 sm:mb-3 sm:h-12 sm:w-12 sm:rounded-2xl lg:mb-4 lg:h-14 lg:w-14">
            <DollarSign size={20} className="sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
          </div>
          <div className="mb-1 text-lg font-bold text-card-foreground transition-transform duration-300 group-hover:scale-105 sm:mb-2 sm:text-xl lg:text-2xl xl:text-3xl">
            <span className="hidden sm:inline">{ingresosTotalesLabel}</span>
            <span className="sm:hidden">{`${ingresosTotalesLabel.slice(0, 6)}...`}</span>
          </div>
          <div className="mb-1 text-xs font-semibold text-muted-foreground sm:text-sm lg:text-lg">
            <span className="hidden sm:inline">Cobranza administrada</span>
            <span className="sm:hidden">Cobranza</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground sm:text-sm">
            <span className="font-semibold text-green-600 dark:text-green-400">{ingresosEsteMesLabel}</span>
            <span className="hidden sm:inline">registrados este mes</span>
          </div>
          <div className="absolute inset-0 -translate-x-full -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-1000 group-hover:translate-x-full group-hover:opacity-100" />
        </div>
      </div>
    </div>
  );
}
