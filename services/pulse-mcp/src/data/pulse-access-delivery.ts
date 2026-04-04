import { pulseMcpConfig } from '../env.js';
import { supabase } from './client.js';
import { buildPulseBrandedEmailHtml, sendPulseEmail } from './email-delivery.js';

type PulseAccessMode = 'welcome' | 'reentry';

function getPulseAccessCopy(mode: PulseAccessMode) {
  if (mode === 'welcome') {
    return {
      subject: 'Tu acceso a Pulse ya está listo',
      title: 'Ya podés entrar a tu espacio de seguimiento',
      intro: 'Pulse reúne en un solo lugar el estado de tu web, los avances del proyecto y lo que necesitemos de tu parte.',
      cta: 'Entrar a Pulse',
    };
  }

  return {
    subject: 'Tu acceso a Pulse fue renovado',
    title: 'Tu enlace para volver a Pulse está listo',
    intro: 'Te enviamos un acceso nuevo para que vuelvas a entrar a Pulse y sigas el estado de tu web desde donde la dejaste.',
    cta: 'Volver a Pulse',
  };
}

function buildHtml(params: { name: string; accessUrl: string; mode: PulseAccessMode }) {
  const copy = getPulseAccessCopy(params.mode);

  return buildPulseBrandedEmailHtml({
    recipientName: params.name,
    heading: copy.title,
    preheader: copy.subject,
    message: copy.intro,
    ctaLabel: copy.cta,
    ctaUrl: params.accessUrl,
  });
}

async function sendPulseAccessEmail(params: {
  email: string;
  name: string;
  accessUrl: string;
  mode: PulseAccessMode;
}) {
  const copy = getPulseAccessCopy(params.mode);
  await sendPulseEmail({
    toEmail: params.email,
    toName: params.name,
    subject: copy.subject,
    htmlbody: buildHtml(params),
    clientReference: `pulse-access:${params.mode}:${params.email}`,
  });
}

export async function deliverPulseAccessEmail(params: {
  email: string;
  fullName: string | null;
  invited: boolean;
}) {
  const mode: PulseAccessMode = params.invited ? 'welcome' : 'reentry';
  const linkResult = await supabase.auth.admin.generateLink({
    type: params.invited ? 'invite' : 'magiclink',
    email: params.email,
    options: { redirectTo: pulseMcpConfig.pulseAccessRedirectUrl },
  });

  if (linkResult.error) {
    throw linkResult.error;
  }

  const accessUrl = linkResult.data?.properties?.action_link;
  if (!accessUrl) {
    throw new Error('PULSE_ACCESS_LINK_MISSING');
  }

  await sendPulseAccessEmail({
    email: params.email,
    name: params.fullName || 'cliente',
    accessUrl,
    mode,
  });

  return {
    email_sent: true,
    delivery_type: params.invited ? 'invite' as const : 'magiclink' as const,
    email_mode: mode,
  };
}
