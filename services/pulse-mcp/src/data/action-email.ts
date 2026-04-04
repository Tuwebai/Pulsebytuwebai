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
