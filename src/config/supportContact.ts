export const SUPPORT_CONTACT = {
  publicEmail: 'hola@tuweb-ai.com',
  inboxEmail: 'tuwebai@gmail.com',
  adminEmail: 'admin@pulse.tuweb-ai.com',
  systemEmail: 'noreply@pulse.tuweb-ai.com',
  phoneDisplay: '+54 9 3571 417960',
  phoneE164: '+5493571417960',
  whatsappNumber: '543571417960',
  hoursDisplay: 'Lunes a viernes de 9:00 a 20:00',
  hoursEmailDisplay: 'Lunes a Viernes 9:00 - 20:00',
  supportPortalLabel: 'pulse.tuweb-ai.com/soporte',
} as const;

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${SUPPORT_CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
