import type { AdminSectionId } from '@/features/admin/constants/adminSections';
import { AdminOperationalStatus } from '@/features/admin/components/AdminOperationalStatus';
import { AdminOverviewStats } from '@/features/admin/components/AdminOverviewStats';
import { AdminQuickActions } from '@/features/admin/components/AdminQuickActions';

interface AdminOverviewScreenProps {
  isCalendarAuthenticated: boolean;
  calendarLoading: boolean;
  calendarUserLabel: string;
  onAuthenticateCalendar: () => void;
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
  pagosCount: number;
  onSectionChange: (sectionId: AdminSectionId) => void;
}

export function AdminOverviewScreen({
  isCalendarAuthenticated,
  calendarLoading,
  calendarUserLabel,
  onAuthenticateCalendar,
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
  pagosCount,
  onSectionChange,
}: AdminOverviewScreenProps) {
  return (
    <>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <AdminOperationalStatus
          isCalendarAuthenticated={isCalendarAuthenticated}
          calendarLoading={calendarLoading}
          calendarUserLabel={calendarUserLabel}
          onAuthenticateCalendar={onAuthenticateCalendar}
          usuariosActivos={usuariosActivos}
          usuariosNuevos={usuariosNuevos}
          proyectosEnCurso={proyectosEnCurso}
          tasaCompletacionProyectos={tasaCompletacionProyectos}
          ticketsAbiertos={ticketsAbiertos}
          ticketsUrgentes={ticketsUrgentes}
          ingresosTotales={ingresosTotales}
          ingresosEsteMes={ingresosEsteMes}
        />

        <AdminQuickActions
          usuariosActivos={usuariosActivos}
          proyectosEnCurso={proyectosEnCurso}
          ticketsAbiertos={ticketsAbiertos}
          pagosCount={pagosCount}
          onSectionChange={onSectionChange}
        />
      </div>
    </>
  );
}
