import config from '@/config/environment';

export const MERCADOPAGO_CONFIG = {
  PUBLIC_KEY: import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || '',
  ENVIRONMENT: import.meta.env.VITE_MERCADOPAGO_ENVIRONMENT || 'production',
  WEBHOOK_URL: `${config.app.publicUrl}/api/webhooks/mercadopago`,
  SUCCESS_URL: `${config.app.publicUrl}/dashboard/pagos?status=success`,
  PENDING_URL: `${config.app.publicUrl}/dashboard/pagos?status=pending`,
  FAILURE_URL: `${config.app.publicUrl}/dashboard/pagos?status=failure`,
  APP_NAME: 'Pulse by TuWebAI',
  APP_VERSION: '1.0.0',
} as const;

export const PAYMENT_TYPES = {
  WEBSITE: {
    id: 'website',
    name: 'Presencia Profesional',
    description: 'Para el negocio que necesita presencia profesional en Google y empezar a recibir consultas.',
    price: 42000000,
    currency: 'ARS',
    features: [
      'Sitio institucional a medida',
      'Diseño responsive para mobile y desktop',
      'Formulario de contacto o WhatsApp',
      'SEO base para aparecer en Google',
      'Analytics configurado desde el día 1',
    ],
    timeline: '2 a 3 semanas',
    cta: 'Quiero esta web',
    badge: null,
    pricePrefix: null,
  },
  ECOMMERCE: {
    id: 'ecommerce',
    name: 'Web Comercial',
    description: 'Para el negocio que quiere que su web genere consultas de forma consistente.',
    price: 78000000,
    currency: 'ARS',
    features: [
      'Arquitectura pensada para convertir',
      'Formularios y automatizaciones',
      'SEO técnico y estructura optimizada',
      'Analytics y seguimiento de conversión',
      'Hosting y dominio profesional por 1 año',
    ],
    timeline: '3 a 4 semanas',
    cta: 'Lanzar mi web comercial',
    badge: 'Más elegido por negocios',
    pricePrefix: null,
  },
  CUSTOM: {
    id: 'custom',
    name: 'Sistema a Medida',
    description: 'Para el negocio que necesita algo que no existe todavía: paneles, flujos e integraciones propias.',
    price: 140000000,
    currency: 'ARS',
    features: [
      'Paneles o módulos personalizados',
      'Integraciones con sistemas externos',
      'Arquitectura escalable',
      'Desarrollo orientado al crecimiento',
      'Diagnóstico técnico incluido antes de arrancar',
    ],
    timeline: 'Según alcance definido en la consulta inicial',
    cta: 'Solicitar propuesta',
    badge: null,
    pricePrefix: 'Desde',
  },
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  AUTHORIZED: 'authorized',
  IN_PROCESS: 'in_process',
  IN_MEDIATION: 'in_mediation',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  CHARGED_BACK: 'charged_back',
} as const;

export const formatCurrency = (amount: number, currency = 'ARS') =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount / 100);

export const toCents = (amount: number) => Math.round(amount * 100);

export const fromCents = (amount: number) => amount / 100;
