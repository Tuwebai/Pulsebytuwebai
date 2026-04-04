import { resolveUserIdentifier } from './users.js';
import { buildPulseBrandedEmailHtml, sendPulseEmail } from './email-delivery.js';

export async function sendBrandedEmail(input: {
  recipientIdentifier: string;
  subject: string;
  message: string;
  heading?: string;
  preheader?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
}) {
  const user = await resolveUserIdentifier(input.recipientIdentifier);
  const subject = input.subject.trim();
  const message = input.message.trim();
  const heading = input.heading?.trim() || subject;

  if (!user.email?.trim()) {
    throw new Error('El destinatario no tiene un email valido en Pulse.');
  }

  if (!subject) {
    throw new Error('Necesitamos un asunto para enviar el email.');
  }

  if (!message) {
    throw new Error('Necesitamos un mensaje para enviar el email.');
  }

  if ((input.ctaLabel && !input.ctaUrl) || (!input.ctaLabel && input.ctaUrl)) {
    throw new Error('Si querés agregar un boton, necesitamos ctaLabel y ctaUrl juntos.');
  }

  const delivery = await sendPulseEmail({
    toEmail: user.email,
    toName: user.full_name,
    subject,
    htmlbody: buildPulseBrandedEmailHtml({
      preheader: input.preheader,
      heading,
      recipientName: user.full_name,
      message,
      ctaLabel: input.ctaLabel,
      ctaUrl: input.ctaUrl,
      footerNote: input.footerNote,
    }),
    clientReference: `pulse-branded-email:${user.id}:${Date.now()}`,
  });

  return {
    resolvedRecipient: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
    },
    email: {
      subject,
      heading,
      preheader: input.preheader?.trim() || null,
      ctaLabel: input.ctaLabel?.trim() || null,
      ctaUrl: input.ctaUrl?.trim() || null,
      footerNote: input.footerNote?.trim() || null,
    },
    delivery,
  };
}

export async function sendOnboardingEmail(input: {
  recipientIdentifier: string;
  nextStep?: string;
  ctaUrl?: string;
}) {
  const nextStep = input.nextStep?.trim() || 'completar tu primer recorrido dentro de Pulse y validar los datos de tu proyecto.';

  return sendBrandedEmail({
    recipientIdentifier: input.recipientIdentifier,
    subject: 'Tu onboarding en Pulse ya está listo',
    heading: 'Ya podés empezar a usar Pulse',
    preheader: 'Te dejamos el acceso listo para que arranques con tu seguimiento.',
    message: `Ya dejamos tu espacio preparado para que empieces a seguir tu web en Pulse.\n\nTu próximo paso es ${nextStep}`,
    ctaLabel: 'Entrar a Pulse',
    ctaUrl: input.ctaUrl?.trim() || 'https://pulse.tuweb-ai.com/dashboard',
    footerNote: 'Si necesitás ayuda para ubicarte dentro de Pulse, respondé este correo y te acompañamos.',
  });
}

export async function sendBillingEmail(input: {
  recipientIdentifier: string;
  summary: string;
  ctaUrl?: string;
  ctaLabel?: string;
  dueDate?: string;
}) {
  const summary = input.summary.trim();

  if (!summary) {
    throw new Error('Necesitamos un resumen para enviar el email de facturación.');
  }

  const dueDateLine = input.dueDate?.trim() ? `\n\nFecha de referencia: ${input.dueDate.trim()}.` : '';

  return sendBrandedEmail({
    recipientIdentifier: input.recipientIdentifier,
    subject: 'Actualización de facturación en Pulse',
    heading: 'Tenemos una novedad sobre tu facturación',
    preheader: 'Te compartimos una actualización operativa desde Pulse.',
    message: `${summary}${dueDateLine}`,
    ctaLabel: input.ctaLabel?.trim() || (input.ctaUrl ? 'Ver detalle' : undefined),
    ctaUrl: input.ctaUrl?.trim(),
    footerNote: 'Si necesitás una aclaración sobre este movimiento, podés responder este correo y lo revisamos con vos.',
  });
}
