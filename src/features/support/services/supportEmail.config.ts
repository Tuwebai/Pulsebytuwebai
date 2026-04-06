import { SUPPORT_CONTACT } from '@/config/supportContact';

export const EMAIL_CONFIG = {
  SERVICE_ID: 'service_flqnerp',
  TEMPLATES: {
    MAIN_TEMPLATE: 'template_support_ticket',
    SECONDARY_TEMPLATE: 'template_ticket_confirmation',
  },
  USER_ID: 'bPdFsDkAPp5dXKALy',
  EMAILS: {
    SUPPORT: SUPPORT_CONTACT.inboxEmail,
    FROM_EMAIL: SUPPORT_CONTACT.inboxEmail,
    SYSTEM: SUPPORT_CONTACT.systemEmail,
  },
};

export const EMAIL_TYPES = {
  SUPPORT_TICKET: 'support_ticket',
  TICKET_CONFIRMATION: 'ticket_confirmation',
  TICKET_RESPONSE: 'ticket_response',
  DAILY_SUMMARY: 'daily_summary',
};

export const initializeEmailJS = () => {
  if (typeof window !== 'undefined' && window.emailjs) {
    window.emailjs.init(EMAIL_CONFIG.USER_ID);
    return true;
  }

  return false;
};

export const sendEmailWithEmailJS = async (templateId: string, templateParams: unknown) => {
  try {
    if (typeof window !== 'undefined' && window.emailjs) {
      const response = await window.emailjs.send(
        EMAIL_CONFIG.SERVICE_ID,
        templateId,
        templateParams,
      );

      return { success: true, message: 'Email enviado correctamente', response };
    }

    throw new Error('EmailJS no esta disponible');
  } catch (error) {
    console.error('Error enviando email con EmailJS:', error);
    return { success: false, message: 'Error enviando email', error };
  }
};

declare global {
  interface Window {
    emailjs: {
      init: (userId: string) => void;
      send: (serviceId: string, templateId: string, templateParams: unknown) => Promise<unknown>;
    };
  }
}
