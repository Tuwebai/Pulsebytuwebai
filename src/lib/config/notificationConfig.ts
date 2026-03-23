// =====================================================
// CONFIGURACIÓN DEL SISTEMA DE NOTIFICACIONES
// =====================================================

export const NOTIFICATION_CONFIG = {
  // Configuración general
  general: {
    maxNotifications: 1000, // Máximo de notificaciones por usuario
    cleanupInterval: 24 * 60 * 60 * 1000, // 24 horas en ms
    retentionDays: 30, // Días que se mantienen las notificaciones leídas
    urgentRetentionDays: 90, // Días que se mantienen las urgentes
    maxUrgentNotifications: 10, // Máximo de notificaciones urgentes simultáneas
  },

  // Configuración de canales
  channels: {
    email: {
      enabled: true,
      maxRetries: 3,
      retryDelay: 5 * 60 * 1000, // 5 minutos
      batchSize: 50, // Envío en lotes
      rateLimit: 100, // Máximo por minuto
    },
    push: {
      enabled: true,
      maxRetries: 3,
      retryDelay: 2 * 60 * 1000, // 2 minutos
      batchSize: 100,
      rateLimit: 200,
      vapidSubject: 'mailto:notifications@tuwebai.com',
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa1HI0F-K-Yw6X5N3iE5qVcK7o5cGcJPBXvRHnMHYfJs5t2ns1DmjX1xDnBUR9c',
    },
    sms: {
      enabled: false, // Requiere integración con proveedor SMS
      maxRetries: 2,
      retryDelay: 1 * 60 * 1000, // 1 minuto
      rateLimit: 10,
    },
    webhook: {
      enabled: true,
      maxRetries: 3,
      retryDelay: 10 * 60 * 1000, // 10 minutos
      timeout: 30 * 1000, // 30 segundos
      maxPayloadSize: 1024 * 1024, // 1MB
    },
    in_app: {
      enabled: true,
      maxNotifications: 100, // Máximo en pantalla
      autoHideDelay: 5000, // 5 segundos
      stackLimit: 5, // Máximo apiladas
    },
  },

  // Configuración de plantillas
  templates: {
    defaultLanguage: 'es',
    supportedLanguages: ['es', 'en'],
    fallbackTemplate: 'default',
    maxVariables: 20,
    maxContentLength: 1000,
    maxSubjectLength: 100,
  },

  // Configuración de reglas
  rules: {
    maxRulesPerUser: 50,
    maxConditionsPerRule: 10,
    maxActionsPerRule: 5,
    evaluationTimeout: 30 * 1000, // 30 segundos
    maxConcurrentEvaluations: 10,
  },

  // Configuración de eventos
  events: {
    // Eventos del sistema
    system: {
      'user.created': { channels: ['email', 'in_app'], template: 'welcome-user' },
      'user.updated': { channels: ['in_app'], template: 'user-updated' },
      'user.deleted': { channels: ['email'], template: 'user-deleted' },
      'user.login': { channels: ['in_app'], template: 'user-login' },
      'user.logout': { channels: ['in_app'], template: 'user-logout' },
    },
    
    // Eventos de proyectos
    project: {
      'project.created': { channels: ['email', 'push', 'in_app'], template: 'project-created' },
      'project.updated': { channels: ['push', 'in_app'], template: 'project-updated' },
      'project.deleted': { channels: ['email', 'in_app'], template: 'project-deleted' },
      'project.completed': { channels: ['email', 'push', 'in_app'], template: 'project-completed' },
      'project.overdue': { channels: ['email', 'push', 'sms'], template: 'project-overdue', urgent: true },
    },
    
    // Eventos de tickets
    ticket: {
      'ticket.created': { channels: ['email', 'push', 'in_app'], template: 'ticket-created' },
      'ticket.assigned': { channels: ['email', 'push', 'in_app'], template: 'ticket-assigned' },
      'ticket.updated': { channels: ['push', 'in_app'], template: 'ticket-updated' },
      'ticket.resolved': { channels: ['email', 'push', 'in_app'], template: 'ticket-resolved' },
      'ticket.escalated': { channels: ['email', 'push', 'sms'], template: 'ticket-escalated', urgent: true },
    },
    
    // Eventos de pagos
    payment: {
      'payment.successful': { channels: ['email', 'push', 'in_app'], template: 'payment-success' },
      'payment.failed': { channels: ['email', 'push', 'in_app'], template: 'payment-failed' },
      'payment.refunded': { channels: ['email', 'in_app'], template: 'payment-refunded' },
      'payment.overdue': { channels: ['email', 'push', 'sms'], template: 'payment-overdue', urgent: true },
      'subscription.expiring': { channels: ['email', 'push', 'in_app'], template: 'subscription-expiring' },
    },
    
    // Eventos de seguridad
    security: {
      'login.attempt': { channels: ['email', 'push'], template: 'login-attempt' },
      'login.failed': { channels: ['email', 'push'], template: 'login-failed' },
      'login.suspicious': { channels: ['email', 'push', 'sms'], template: 'login-suspicious', urgent: true },
      'password.changed': { channels: ['email', 'push'], template: 'password-changed' },
      'account.locked': { channels: ['email', 'sms'], template: 'account-locked', urgent: true },
      'security.breach': { channels: ['email', 'push', 'sms'], template: 'security-breach', urgent: true },
    },
    
    // Eventos de facturación
    billing: {
      'invoice.generated': { channels: ['email', 'in_app'], template: 'invoice-generated' },
      'invoice.overdue': { channels: ['email', 'push', 'sms'], template: 'invoice-overdue', urgent: true },
      'subscription.expired': { channels: ['email', 'push', 'sms'], template: 'subscription-expired', urgent: true },
      'quota.exceeded': { channels: ['email', 'push', 'in_app'], template: 'quota-exceeded' },
    },
  },

  // Configuración de prioridades
  priorities: {
    critical: { level: 1, color: '#dc2626', icon: '🚨', channels: ['email', 'push', 'sms', 'in_app'] },
    urgent: { level: 2, color: '#ea580c', icon: '⚠️', channels: ['email', 'push', 'in_app'] },
    high: { level: 3, color: '#d97706', icon: '🔶', channels: ['email', 'push', 'in_app'] },
    normal: { level: 4, color: '#059669', icon: 'ℹ️', channels: ['email', 'in_app'] },
    low: { level: 5, color: '#6b7280', icon: '📝', channels: ['in_app'] },
  },

  // Configuración de categorías
  categories: {
    system: { color: '#6b7280', icon: '⚙️', description: 'Notificaciones del sistema' },
    project: { color: '#10b981', icon: '📁', description: 'Actualizaciones de proyectos' },
    ticket: { color: '#f59e0b', icon: '🎫', description: 'Tickets de soporte' },
    payment: { color: '#8b5cf6', icon: '💳', description: 'Pagos y facturación' },
    security: { color: '#ef4444', icon: '🔒', description: 'Alertas de seguridad' },
    user: { color: '#3b82f6', icon: '👤', description: 'Actividad del usuario' },
    billing: { color: '#f97316', icon: '📊', description: 'Facturación y cuotas' },
  },

  // Configuración de tipos
  types: {
    info: { color: '#3b82f6', icon: 'ℹ️', description: 'Información general' },
    success: { color: '#10b981', icon: '✅', description: 'Operación exitosa' },
    warning: { color: '#f59e0b', icon: '⚠️', description: 'Advertencia' },
    error: { color: '#ef4444', icon: '❌', description: 'Error del sistema' },
    critical: { color: '#dc2626', icon: '🚨', description: 'Error crítico' },
  },

  // Configuración de horarios
  schedules: {
    quietHours: {
      enabled: true,
      start: '22:00', // 10:00 PM
      end: '08:00',  // 8:00 AM
      timezone: 'America/Mexico_City',
      exceptions: ['security', 'critical'], // Tipos que no respetan horario silencioso
    },
    businessHours: {
      enabled: true,
      start: '09:00', // 9:00 AM
      end: '18:00',  // 6:00 PM
      timezone: 'America/Mexico_City',
      days: [1, 2, 3, 4, 5], // Lunes a Viernes
    },
  },

  // Configuración de agrupación
  grouping: {
    enabled: true,
    maxGroupSize: 10,
    groupBy: ['category', 'type', 'date'],
    collapseThreshold: 5, // Agrupar si hay más de 5 notificaciones similares
    timeWindow: 5 * 60 * 1000, // 5 minutos para agrupar por tiempo
  },

  // Configuración de personalización
  personalization: {
    enabled: true,
    userPreferences: true,
    channelPreferences: true,
    frequencyControl: true,
    contentCustomization: true,
    languagePreference: true,
  },

  // Configuración de analytics
  analytics: {
    enabled: true,
    trackDelivery: true,
    trackEngagement: true,
    trackPerformance: true,
    retentionPeriod: 90, // Días
    anonymizeData: false,
  },

  // Configuración de pruebas
  testing: {
    enabled: process.env.NODE_ENV === 'development',
    testMode: false,
    mockChannels: ['email', 'push'],
    testUserId: 'test-user-id',
    logLevel: 'debug',
  },
};

// =====================================================
// CONFIGURACIÓN DE PLANTILLAS POR DEFECTO
// =====================================================

export const DEFAULT_TEMPLATES = {
  'welcome-user': {
    name: 'Bienvenida de Usuario',
    category: 'user',
    channels: ['email', 'in_app'],
    subject: 'Bienvenido a Pulse by TuWebAI, {{user.fullName}}',
    content: 'Hola {{user.fullName}}, nos alegra que te hayas unido a Pulse by TuWebAI. Tu cuenta ha sido creada exitosamente.',
    variables: {
      user: {
        fullName: { type: 'string', required: true, description: 'Nombre completo del usuario' },
        email: { type: 'string', required: true, description: 'Email del usuario' }
      }
    }
  },
  
  'project-update': {
    name: 'Actualización de Proyecto',
    category: 'project',
    channels: ['email', 'push', 'in_app'],
    subject: 'Proyecto {{project.name}} - {{update.type}}',
    content: 'El proyecto "{{project.name}}" ha sido {{update.action}}. {{update.description}}',
    variables: {
      project: {
        name: { type: 'string', required: true, description: 'Nombre del proyecto' },
        id: { type: 'string', required: true, description: 'ID del proyecto' }
      },
      update: {
        type: { type: 'string', required: true, description: 'Tipo de actualización' },
        action: { type: 'string', required: true, description: 'Acción realizada' },
        description: { type: 'string', required: true, description: 'Descripción de la actualización' }
      }
    }
  },
  
  'security-alert': {
    name: 'Alerta de Seguridad',
    category: 'security',
    channels: ['email', 'push', 'sms'],
    subject: '🚨 Alerta de Seguridad - {{alert.type}}',
    content: 'Se ha detectado una actividad de seguridad: {{alert.description}}. IP: {{alert.ipAddress}}',
    variables: {
      alert: {
        type: { type: 'string', required: true, description: 'Tipo de alerta' },
        description: { type: 'string', required: true, description: 'Descripción de la alerta' },
        ipAddress: { type: 'string', required: true, description: 'Dirección IP' }
      }
    }
  }
};

// =====================================================
// CONFIGURACIÓN DE REGLAS POR DEFECTO
// =====================================================

export const DEFAULT_RULES = [
  {
    name: 'Notificación de Bienvenida',
    description: 'Enviar notificación de bienvenida a nuevos usuarios',
    triggerEvent: 'user.created',
    conditions: [],
    actions: [
      {
        type: 'send_notification',
        config: { template: 'welcome-user' },
        channels: ['email', 'in_app'],
        recipients: 'user'
      }
    ],
    priority: 1,
    isActive: true
  },
  
  {
    name: 'Alerta de Login Sospechoso',
    description: 'Notificar intentos de login sospechosos',
    triggerEvent: 'login.suspicious',
    conditions: [
      {
        field: 'metadata.location',
        operator: 'not_equals',
        value: '{{user.lastKnownLocation}}',
        logicalOperator: 'AND'
      },
      {
        field: 'metadata.device',
        operator: 'not_equals',
        value: '{{user.lastKnownDevice}}'
      }
    ],
    actions: [
      {
        type: 'send_notification',
        config: { template: 'security-alert' },
        channels: ['email', 'push', 'sms'],
        recipients: 'user'
      }
    ],
    priority: 1,
    isActive: true
  },
  
  {
    name: 'Recordatorio de Proyectos Vencidos',
    description: 'Notificar proyectos próximos a vencer',
    triggerEvent: 'project.overdue',
    conditions: [
      {
        field: 'metadata.daysUntilDue',
        operator: 'less_than',
        value: 3
      }
    ],
    actions: [
      {
        type: 'send_notification',
        config: { template: 'project-overdue' },
        channels: ['email', 'push'],
        recipients: 'user'
      }
    ],
    priority: 2,
    isActive: true
  }
];

// =====================================================
// UTILIDADES DE CONFIGURACIÓN
// =====================================================

export const getNotificationConfig = (key: string) => {
  const keys = key.split('.');
  let value: any = NOTIFICATION_CONFIG;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return undefined;
    }
  }
  
  return value;
};

export const isChannelEnabled = (channel: string): boolean => {
  return NOTIFICATION_CONFIG.channels[channel as keyof typeof NOTIFICATION_CONFIG.channels]?.enabled || false;
};

export const getPriorityConfig = (priority: string) => {
  return NOTIFICATION_CONFIG.priorities[priority as keyof typeof NOTIFICATION_CONFIG.priorities];
};

export const getCategoryConfig = (category: string) => {
  return NOTIFICATION_CONFIG.categories[category as keyof typeof NOTIFICATION_CONFIG.categories];
};

export const getTypeConfig = (type: string) => {
  return NOTIFICATION_CONFIG.types[type as keyof typeof NOTIFICATION_CONFIG.types];
};

export const isQuietHours = (): boolean => {
  if (!NOTIFICATION_CONFIG.schedules.quietHours.enabled) return false;
  
  const now = new Date();
  const currentTime = now.toLocaleTimeString('en-US', { 
    hour12: false, 
    timeZone: NOTIFICATION_CONFIG.schedules.quietHours.timezone 
  });
  
  const { start, end } = NOTIFICATION_CONFIG.schedules.quietHours;
  return currentTime >= start || currentTime <= end;
};

export const isBusinessHours = (): boolean => {
  if (!NOTIFICATION_CONFIG.schedules.businessHours.enabled) return false;
  
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Domingo, 1 = Lunes, etc.
  const currentTime = now.toLocaleTimeString('en-US', { 
    hour12: false, 
    timeZone: NOTIFICATION_CONFIG.schedules.businessHours.timezone 
  });
  
  const { start, end, days } = NOTIFICATION_CONFIG.schedules.businessHours;
  return days.includes(currentDay) && currentTime >= start && currentTime <= end;
};

export default NOTIFICATION_CONFIG;
