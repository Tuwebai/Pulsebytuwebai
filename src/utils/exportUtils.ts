import { Project, User } from '@/contexts/AppContext';

type ExportableRecord = Record<string, string | number | boolean | null | undefined>;

const getProjectCreatedAt = (project: Project): string => project.created_at;
const getProjectUpdatedAt = (project: Project): string => project.updated_at;
const getUserDisplayName = (user: User): string => user.full_name ?? user.email;
const getUserTheme = (_user: User): string => 'Sistema';
const getUserEmailNotifications = (user: User): boolean => user.email_notifications !== false;
const getUserPushNotifications = (user: User): boolean => user.push_notifications !== false;

export const exportToCSV = (data: ExportableRecord[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          const escapedValue = String(value).replace(/"/g, '""');
          return escapedValue.includes(',') ? `"${escapedValue}"` : escapedValue;
        })
        .join(','),
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToJSON = <T>(data: T[], filename: string) => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportProjects = (projects: Project[], format: 'csv' | 'json' = 'csv') => {
  const exportData = projects.map((project) => ({
    ID: project.id,
    Nombre: project.name,
    Descripcion: project.description,
    Tipo: project.type,
    Funcionalidades: project.funcionalidades?.join('; ') || '',
    Fecha_Creacion: new Date(getProjectCreatedAt(project)).toLocaleDateString('es-ES'),
    Ultima_Actualizacion: new Date(getProjectUpdatedAt(project)).toLocaleDateString('es-ES'),
    Progreso: calculateProjectProgress(project),
    Estado: getProjectStatus(project),
    Fases_Completadas: getCompletedPhases(project),
    Total_Fases: project.fases?.length || 0,
    Comentarios_Totales: getTotalComments(project),
  }));

  const filename = `proyectos_${new Date().toISOString().split('T')[0]}`;

  if (format === 'csv') {
    exportToCSV(exportData, filename);
  } else {
    exportToJSON(exportData, filename);
  }
};

export const exportUserData = (user: User, projects: Project[], format: 'csv' | 'json' = 'csv') => {
  const userData = {
    Informacion_Personal: {
      Nombre: getUserDisplayName(user),
      Email: user.email,
      Rol: user.role,
      Empresa: user.company || 'No especificada',
      Cargo: user.position || 'No especificado',
      Telefono: user.phone || 'No especificado',
      Ubicacion: user.location || 'No especificada',
      Sitio_Web: user.website || 'No especificado',
      Fecha_Registro: user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'No disponible',
      Ultima_Actualizacion: user.updated_at
        ? new Date(user.updated_at).toLocaleDateString('es-ES')
        : 'No disponible',
    },
    Configuracion: {
      Tema: getUserTheme(user),
      Sitio_Web: user.website || 'No especificado',
      Seguridad_2FA: user.two_factor_auth ? 'Activada' : 'Desactivada',
      Animaciones: user.animations_enabled !== false ? 'Activadas' : 'Desactivadas',
      Modo_Bajo_Ancho_Banda: user.low_bandwidth_mode ? 'Activado' : 'Desactivado',
      Notificaciones_Email: getUserEmailNotifications(user) ? 'Activadas' : 'Desactivadas',
      Notificaciones_Push: getUserPushNotifications(user) ? 'Activadas' : 'Desactivadas',
    },
    Proyectos: projects.map((project) => ({
      ID: project.id,
      Nombre: project.name,
      Tipo: project.type,
      Progreso: calculateProjectProgress(project),
      Estado: getProjectStatus(project),
      Fecha_Creacion: new Date(getProjectCreatedAt(project)).toLocaleDateString('es-ES'),
    })),
  };

  const filename = `datos_usuario_${user.email}_${new Date().toISOString().split('T')[0]}`;

  if (format === 'csv') {
    exportToCSV([userData.Informacion_Personal], `${filename}_informacion_personal`);
    exportToCSV([userData.Configuracion], `${filename}_configuracion`);
    exportToCSV(userData.Proyectos, `${filename}_proyectos`);
  } else {
    exportToJSON([userData], filename);
  }
};

export const exportCompleteReport = (user: User, projects: Project[], format: 'csv' | 'json' = 'csv') => {
  const reportData = {
    Usuario: {
      Nombre: getUserDisplayName(user),
      Email: user.email,
      Rol: user.role,
      Fecha_Registro: user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'No disponible',
    },
    Estadisticas_Generales: {
      Total_Proyectos: projects.length,
      Proyectos_Completados: projects.filter((project) => getProjectStatus(project) === 'Completado').length,
      Proyectos_En_Progreso: projects.filter((project) => getProjectStatus(project).includes('progreso')).length,
      Proyectos_Sin_Iniciar: projects.filter((project) => getProjectStatus(project) === 'Sin iniciar').length,
      Progreso_Promedio:
        Math.round(projects.reduce((accumulator, project) => accumulator + calculateProjectProgress(project), 0) / projects.length) ||
        0,
    },
    Proyectos_Detallados: projects.map((project) => ({
      ID: project.id,
      Nombre: project.name,
      Descripcion: project.description,
      Tipo: project.type,
      Progreso: calculateProjectProgress(project),
      Estado: getProjectStatus(project),
      Fecha_Creacion: new Date(getProjectCreatedAt(project)).toLocaleDateString('es-ES'),
      Ultima_Actualizacion: new Date(getProjectUpdatedAt(project)).toLocaleDateString('es-ES'),
      Funcionalidades: project.funcionalidades?.length || 0,
      Fases_Completadas: getCompletedPhases(project),
      Total_Fases: project.fases?.length || 0,
      Comentarios_Totales: getTotalComments(project),
    })),
  };

  const filename = `reporte_completo_${user.email}_${new Date().toISOString().split('T')[0]}`;

  if (format === 'csv') {
    exportToCSV([reportData.Usuario], `${filename}_usuario`);
    exportToCSV([reportData.Estadisticas_Generales], `${filename}_estadisticas`);
    exportToCSV(reportData.Proyectos_Detallados, `${filename}_proyectos_detallados`);
  } else {
    exportToJSON([reportData], filename);
  }
};

const calculateProjectProgress = (project: Project): number => {
  if (!project.fases || project.fases.length === 0) return 0;
  const completedPhases = project.fases.filter((fase) => fase.estado === 'Terminado').length;
  return Math.round((completedPhases / project.fases.length) * 100);
};

const getProjectStatus = (project: Project): string => {
  if (!project.fases || project.fases.length === 0) return 'Sin iniciar';

  const completedPhases = project.fases.filter((fase) => fase.estado === 'Terminado').length;
  const totalPhases = project.fases.length;

  if (completedPhases === 0) return 'Sin iniciar';
  if (completedPhases === totalPhases) return 'Completado';
  if (completedPhases > totalPhases / 2) return 'En progreso avanzado';
  return 'En progreso';
};

const getCompletedPhases = (project: Project): number => {
  return project.fases?.filter((fase) => fase.estado === 'Terminado').length || 0;
};

const getTotalComments = (project: Project): number => {
  return (
    project.fases?.reduce((total, fase) => total + (fase.comentarios?.length || 0), 0) || 0
  );
};

export const exportActivityReport = (projects: Project[], format: 'csv' | 'json' = 'csv') => {
  const activityData = projects.flatMap((project) => {
    const activities: Array<{
      Proyecto: string;
      Actividad: string;
      Fecha: string;
      Hora: string;
      Detalles: string;
    }> = [];

    activities.push({
      Proyecto: project.name,
      Actividad: 'Proyecto creado',
      Fecha: new Date(getProjectCreatedAt(project)).toLocaleDateString('es-ES'),
      Hora: new Date(getProjectCreatedAt(project)).toLocaleTimeString('es-ES'),
      Detalles: `Proyecto ${project.type} creado`,
    });

    if (getProjectUpdatedAt(project) !== getProjectCreatedAt(project)) {
      activities.push({
        Proyecto: project.name,
        Actividad: 'Proyecto actualizado',
        Fecha: new Date(getProjectUpdatedAt(project)).toLocaleDateString('es-ES'),
        Hora: new Date(getProjectUpdatedAt(project)).toLocaleTimeString('es-ES'),
        Detalles: 'Ultima actualizacion del proyecto',
      });
    }

    project.fases?.forEach((fase) => {
      fase.comentarios?.forEach((comentario) => {
        activities.push({
          Proyecto: project.name,
          Actividad: 'Comentario agregado',
          Fecha: new Date(comentario.fecha).toLocaleDateString('es-ES'),
          Hora: new Date(comentario.fecha).toLocaleTimeString('es-ES'),
          Detalles: `${fase.descripcion}: ${comentario.texto.substring(0, 50)}...`,
        });
      });
    });

    return activities;
  });

  activityData.sort(
    (left, right) =>
      new Date(`${right.Fecha} ${right.Hora}`).getTime() - new Date(`${left.Fecha} ${left.Hora}`).getTime(),
  );

  const filename = `reporte_actividad_${new Date().toISOString().split('T')[0]}`;

  if (format === 'csv') {
    exportToCSV(activityData, filename);
  } else {
    exportToJSON(activityData, filename);
  }
};

export const exportUserSettings = (user: User, format: 'csv' | 'json' = 'csv') => {
  const settingsData = {
    Cuenta: {
      Tema: getUserTheme(user),
      Nombre: getUserDisplayName(user),
      Email: user.email,
      Rol: user.role,
      Sitio_Web: user.website || 'No especificado',
    },
    Notificaciones: {
      Notificaciones_Email: getUserEmailNotifications(user) ? 'Activadas' : 'Desactivadas',
      Notificaciones_Push: getUserPushNotifications(user) ? 'Activadas' : 'Desactivadas',
      Notificaciones_SMS: user.sms_notifications ? 'Activadas' : 'Desactivadas',
      Sonidos: user.sound_enabled !== false ? 'Activados' : 'Desactivados',
      Vibracion: user.vibration_enabled !== false ? 'Activada' : 'Desactivada',
      Horas_Silenciosas: user.quiet_hours ? 'Activadas' : 'Desactivadas',
      Actualizaciones_Proyectos: user.project_updates !== false ? 'Activadas' : 'Desactivadas',
      Recordatorios_Pago: user.payment_reminders !== false ? 'Activados' : 'Desactivados',
      Actualizaciones_Soporte: user.support_updates !== false ? 'Activadas' : 'Desactivadas',
      Emails_Marketing: user.marketing_emails ? 'Activados' : 'Desactivados',
    },
    Experiencia: {
      Animaciones: user.animations_enabled !== false ? 'Activadas' : 'Desactivadas',
      Modo_Bajo_Ancho_Banda: user.low_bandwidth_mode ? 'Activado' : 'Desactivado',
    },
    Seguridad: {
      Autenticacion_Dos_Factores: user.two_factor_auth ? 'Activada' : 'Desactivada',
      Tiempo_Sesion: user.session_timeout || 30,
      Notificaciones_Login: user.login_notifications !== false ? 'Activadas' : 'Desactivadas',
      Gestion_Dispositivos: user.device_management !== false ? 'Activada' : 'Desactivada',
    },
  };

  const filename = `configuracion_usuario_${user.email}_${new Date().toISOString().split('T')[0]}`;

  if (format === 'csv') {
    Object.entries(settingsData).forEach(([category, data]) => {
      exportToCSV([data], `${filename}_${category.toLowerCase().replace(/\s+/g, '_')}`);
    });
  } else {
    exportToJSON([settingsData], filename);
  }
};
