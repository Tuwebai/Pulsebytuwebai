import { Project, User } from '@/contexts/AppContext';

type ExportableRecord = Record<string, string | number | boolean | null | undefined>;

const getProjectCreatedAt = (project: Project): string => project.created_at;
const getProjectUpdatedAt = (project: Project): string => project.updated_at;
const getUserDisplayName = (user: User): string => user.full_name ?? user.email;
const getUserTheme = (_user: User): string => 'Sistema';
const getUserDateFormat = (user: User): string => user.date_format || 'DD/MM/YYYY';
const getUserTimeFormat = (user: User): string => user.time_format || '24h';
const getUserProfileVisibility = (user: User): string => user.profile_visibility || 'P?blico';
const getUserEmailNotifications = (user: User): boolean => user.email_notifications !== false;
const getUserPushNotifications = (user: User): boolean => user.push_notifications !== false;

// Función para exportar a CSV
export const exportToCSV = (data: ExportableRecord[], filename: string) => {
  if (data.length === 0) return;

  // Obtener headers del primer objeto
  const headers = Object.keys(data[0]);
  
  // Crear contenido CSV
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escapar comillas y envolver en comillas si contiene coma
        const escapedValue = String(value).replace(/"/g, '""');
        return escapedValue.includes(',') ? `"${escapedValue}"` : escapedValue;
      }).join(',')
    )
  ].join('\n');

  // Crear y descargar archivo
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

// Función para exportar a JSON
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

// Función para exportar proyectos específicos
export const exportProjects = (projects: Project[], format: 'csv' | 'json' = 'csv') => {
  const exportData = projects.map(project => ({
    ID: project.id,
    Nombre: project.name,
    Descripción: project.description,
    Tipo: project.type,
    Funcionalidades: project.funcionalidades?.join('; ') || '',
    Fecha_Creación: new Date(getProjectCreatedAt(project)).toLocaleDateString('es-ES'),
    Última_Actualización: new Date(getProjectUpdatedAt(project)).toLocaleDateString('es-ES'),
    Progreso: calculateProjectProgress(project),
    Estado: getProjectStatus(project),
    Fases_Completadas: getCompletedPhases(project),
    Total_Fases: project.fases?.length || 0,
    Comentarios_Totales: getTotalComments(project)
  }));

  const filename = `proyectos_${new Date().toISOString().split('T')[0]}`;
  
  if (format === 'csv') {
    exportToCSV(exportData, filename);
  } else {
    exportToJSON(exportData, filename);
  }
};

// Función para exportar datos de usuario
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
      Ultima_Actualizacion: user.updated_at ? new Date(user.updated_at).toLocaleDateString('es-ES') : 'No disponible'
    },
    Configuracion: {
      Tema: getUserTheme(user),
      Idioma: user.language || 'Espanol',
      Zona_Horaria: user.timezone || 'No especificada',
      Notificaciones_Email: getUserEmailNotifications(user) ? 'Activadas' : 'Desactivadas',
      Notificaciones_Push: getUserPushNotifications(user) ? 'Activadas' : 'Desactivadas'
    },
    Proyectos: projects.map(project => ({
      ID: project.id,
      Nombre: project.name,
      Tipo: project.type,
      Progreso: calculateProjectProgress(project),
      Estado: getProjectStatus(project),
      Fecha_Creación: new Date(getProjectCreatedAt(project)).toLocaleDateString('es-ES')
    }))
  };

  const filename = `datos_usuario_${user.email}_${new Date().toISOString().split('T')[0]}`;
  
  if (format === 'csv') {
    // Exportar información personal
    exportToCSV([userData.Informacion_Personal], `${filename}_informacion_personal`);
    // Exportar configuración
    exportToCSV([userData.Configuracion], `${filename}_configuracion`);
    // Exportar proyectos
    exportToCSV(userData.Proyectos, `${filename}_proyectos`);
  } else {
    exportToJSON([userData], filename);
  }
};

// Función para exportar reporte completo
export const exportCompleteReport = (user: User, projects: Project[], format: 'csv' | 'json' = 'csv') => {
  const reportData = {
    Usuario: {
      Nombre: getUserDisplayName(user),
      Email: user.email,
      Rol: user.role,
      Fecha_Registro: user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : 'No disponible'
    },
    Estadísticas_Generales: {
      Total_Proyectos: projects.length,
      Proyectos_Completados: projects.filter(p => getProjectStatus(p) === 'Completado').length,
      Proyectos_En_Progreso: projects.filter(p => getProjectStatus(p).includes('progreso')).length,
      Proyectos_Sin_Iniciar: projects.filter(p => getProjectStatus(p) === 'Sin iniciar').length,
      Progreso_Promedio: Math.round(projects.reduce((acc, p) => acc + calculateProjectProgress(p), 0) / projects.length) || 0
    },
    Proyectos_Detallados: projects.map(project => ({
      ID: project.id,
      Nombre: project.name,
      Descripción: project.description,
      Tipo: project.type,
      Progreso: calculateProjectProgress(project),
      Estado: getProjectStatus(project),
      Fecha_Creación: new Date(getProjectCreatedAt(project)).toLocaleDateString('es-ES'),
      Última_Actualización: new Date(getProjectUpdatedAt(project)).toLocaleDateString('es-ES'),
      Funcionalidades: project.funcionalidades?.length || 0,
      Fases_Completadas: getCompletedPhases(project),
      Total_Fases: project.fases?.length || 0,
      Comentarios_Totales: getTotalComments(project)
    }))
  };

  const filename = `reporte_completo_${user.email}_${new Date().toISOString().split('T')[0]}`;
  
  if (format === 'csv') {
    // Exportar información del usuario
    exportToCSV([reportData.Usuario], `${filename}_usuario`);
    // Exportar estadísticas
    exportToCSV([reportData.Estadísticas_Generales], `${filename}_estadisticas`);
    // Exportar proyectos detallados
    exportToCSV(reportData.Proyectos_Detallados, `${filename}_proyectos_detallados`);
  } else {
    exportToJSON([reportData], filename);
  }
};

// Funciones auxiliares
const calculateProjectProgress = (project: Project): number => {
  if (!project.fases || project.fases.length === 0) return 0;
  const completedPhases = project.fases.filter(f => f.estado === 'Terminado').length;
  return Math.round((completedPhases / project.fases.length) * 100);
};

const getProjectStatus = (project: Project): string => {
  if (!project.fases || project.fases.length === 0) return 'Sin iniciar';
  
  const completedPhases = project.fases.filter(f => f.estado === 'Terminado').length;
  const totalPhases = project.fases.length;
  
  if (completedPhases === 0) return 'Sin iniciar';
  if (completedPhases === totalPhases) return 'Completado';
  if (completedPhases > totalPhases / 2) return 'En progreso avanzado';
  return 'En progreso';
};

const getCompletedPhases = (project: Project): number => {
  return project.fases?.filter(f => f.estado === 'Terminado').length || 0;
};

const getTotalComments = (project: Project): number => {
  return project.fases?.reduce((total, fase) => 
    total + (fase.comentarios?.length || 0), 0) || 0;
};

// Función para generar reporte de actividad
export const exportActivityReport = (projects: Project[], format: 'csv' | 'json' = 'csv') => {
  const activityData = projects.flatMap(project => {
    const activities = [];
    
    // Actividad de creación
    activities.push({
      Proyecto: project.name,
      Actividad: 'Proyecto creado',
      Fecha: new Date(getProjectCreatedAt(project)).toLocaleDateString('es-ES'),
      Hora: new Date(getProjectCreatedAt(project)).toLocaleTimeString('es-ES'),
      Detalles: `Proyecto ${project.type} creado`
    });

    // Actividad de actualización
    if (getProjectUpdatedAt(project) !== getProjectCreatedAt(project)) {
      activities.push({
        Proyecto: project.name,
        Actividad: 'Proyecto actualizado',
        Fecha: new Date(getProjectUpdatedAt(project)).toLocaleDateString('es-ES'),
        Hora: new Date(getProjectUpdatedAt(project)).toLocaleTimeString('es-ES'),
        Detalles: 'Última actualización del proyecto'
      });
    }

    // Actividades de fases
    project.fases?.forEach(fase => {
      if (fase.comentarios) {
        fase.comentarios.forEach(comentario => {
          activities.push({
            Proyecto: project.name,
            Actividad: 'Comentario agregado',
            Fecha: new Date(comentario.fecha).toLocaleDateString('es-ES'),
            Hora: new Date(comentario.fecha).toLocaleTimeString('es-ES'),
            Detalles: `${fase.descripcion}: ${comentario.texto.substring(0, 50)}...`
          });
        });
      }
    });

    return activities;
  });

  // Ordenar por fecha
  activityData.sort((a, b) => new Date(b.Fecha + ' ' + b.Hora).getTime() - new Date(a.Fecha + ' ' + a.Hora).getTime());

  const filename = `reporte_actividad_${new Date().toISOString().split('T')[0]}`;
  
  if (format === 'csv') {
    exportToCSV(activityData, filename);
  } else {
    exportToJSON(activityData, filename);
  }
};

// Función para exportar configuración del usuario
export const exportUserSettings = (user: User, format: 'csv' | 'json' = 'csv') => {
  const settingsData = {
    Configuración_General: {
      Tema: getUserTheme(user),
      Idioma: user.language || 'Español',
      Zona_Horaria: user.timezone || 'No especificada',
      Formato_Fecha: getUserDateFormat(user),
      Formato_Hora: getUserTimeFormat(user)
    },
    Privacidad: {
      Visibilidad_Perfil: getUserProfileVisibility(user),
      Mostrar_Email: user.show_email ? 'Si' : 'No',
      Mostrar_Telefono: user.show_phone ? 'Si' : 'No',
      Permitir_Analytics: user.allow_analytics !== false ? 'Si' : 'No',
      Permitir_Cookies: user.allow_cookies !== false ? 'Si' : 'No',
      Autenticacion_Dos_Factores: user.two_factor_auth ? 'Activada' : 'Desactivada'
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
      Emails_Marketing: user.marketing_emails ? 'Activados' : 'Desactivados'
    },
    Rendimiento: {
      Guardado_Automatico: user.auto_save !== false ? 'Activado' : 'Desactivado',
      Intervalo_Guardado: user.auto_save_interval || 30,
      Cache_Habilitado: user.cache_enabled !== false ? 'Activado' : 'Desactivado',
      Calidad_Imagen: user.image_quality || 'Alta',
      Animaciones: user.animations_enabled !== false ? 'Activadas' : 'Desactivadas',
      Modo_Bajo_Ancho_Banda: user.low_bandwidth_mode ? 'Activado' : 'Desactivado'
    },
    Seguridad: {
      Tiempo_Sesion: user.session_timeout || 30,
      Intentos_Maximos_Login: user.max_login_attempts || 5,
      Requerir_Cambio_Contrasena: user.require_password_change ? 'Si' : 'No',
      Expiracion_Contrasena: user.password_expiry_days || 90,
      Notificaciones_Login: user.login_notifications !== false ? 'Activadas' : 'Desactivadas',
      Gestion_Dispositivos: user.device_management !== false ? 'Activada' : 'Desactivada'
    }
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
