import { AdminOverviewHeader } from '@/features/admin/overview/components/AdminOverviewHeader';
import { AdminOperationalStatus } from '@/features/admin/components/AdminOperationalStatus';
import { AdminOverviewStats } from '@/features/admin/components/AdminOverviewStats';
import type { AdminSectionChangeHandler } from '@/features/admin/types/adminNavigation';

interface AdminOverviewScreenProps {
  usuariosActivos: number;
  usuariosNuevos: number;
  crecimientoUsuarios: number;
  proyectosTotales: number;
  proyectosNuevos: number;
  proyectosEnCurso: number;
  tasaCompletacionProyectos: number;
  ticketsAbiertos: number;
  ticketsUrgentes: number;
  ticketsEnProgreso: number;
  ingresosTotales: number;
  ingresosEsteMes: number;
  onRefresh: () => void;
  onSectionChange: AdminSectionChangeHandler;
}

export function AdminOverviewScreen({
  usuariosActivos,
  usuariosNuevos,
  crecimientoUsuarios,
  proyectosTotales,
  proyectosNuevos,
  proyectosEnCurso,
  tasaCompletacionProyectos,
  ticketsAbiertos,
  ticketsUrgentes,
  ticketsEnProgreso,
  ingresosTotales,
  ingresosEsteMes,
  onRefresh,
  onSectionChange,
}: AdminOverviewScreenProps) {
  return (
    <div className="space-y-4 sm:space-y-5">
      <AdminOverviewHeader
        clientesActivos={usuariosActivos}
        ticketsAbiertos={ticketsAbiertos}
        proyectosEnCurso={proyectosEnCurso}
        onRefresh={onRefresh}
      />

      <AdminOverviewStats
        usuariosActivos={usuariosActivos}
        usuariosNuevos={usuariosNuevos}
        crecimientoUsuarios={crecimientoUsuarios}
        proyectosTotales={proyectosTotales}
        proyectosNuevos={proyectosNuevos}
        ticketsAbiertos={ticketsAbiertos}
        ticketsUrgentes={ticketsUrgentes}
        ticketsEnProgreso={ticketsEnProgreso}
        ingresosTotales={ingresosTotales}
        ingresosEsteMes={ingresosEsteMes}
      />

      <div className="grid grid-cols-1 gap-4">
        <AdminOperationalStatus
          usuariosActivos={usuariosActivos}
          usuariosNuevos={usuariosNuevos}
          proyectosEnCurso={proyectosEnCurso}
          tasaCompletacionProyectos={tasaCompletacionProyectos}
          ticketsAbiertos={ticketsAbiertos}
          ticketsUrgentes={ticketsUrgentes}
          ingresosTotales={ingresosTotales}
          ingresosEsteMes={ingresosEsteMes}
          onSectionChange={onSectionChange}
        />
      </div>
    </div>
  );
}
