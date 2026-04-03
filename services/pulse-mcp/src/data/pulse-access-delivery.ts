import { pulseMcpConfig } from '../env.js';
import { supabase } from './client.js';

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

  return `<!doctype html>
  <html lang="es">
    <body style="margin:0;padding:24px;background:#0B0F1E;color:#F0F4FF;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:620px;margin:0 auto;">
        <div style="height:3px;background:linear-gradient(90deg,#3B9EF5 0%,#7B4CD4 38%,#E040A0 72%,#FF9D00 100%);border-radius:999px;"></div>
        <div style="margin-top:18px;padding:28px;background:#111827;border:1px solid rgba(255,255,255,0.08);border-radius:20px;">
          <div style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#8B9AC0;">Pulse by TuWebAI</div>
          <h1 style="margin:12px 0 10px;font-size:28px;line-height:1.2;color:#F0F4FF;">Hola ${params.name || 'cliente'},</h1>
          <h2 style="margin:0 0 14px;font-size:22px;line-height:1.35;color:#F0F4FF;">${copy.title}</h2>
          <p style="margin:0 0 18px;font-size:16px;line-height:1.75;color:#C9D5F4;">${copy.intro}</p>
          <a href="${params.accessUrl}" style="display:inline-block;background:#3B9EF5;color:#fff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:700;">${copy.cta}</a>
          <p style="margin:18px 0 0;font-size:13px;line-height:1.7;color:#8B9AC0;">Si el botón no abre bien, copiá este enlace en tu navegador:<br /><a href="${params.accessUrl}" style="color:#8BC6FF;text-decoration:none;word-break:break-all;">${params.accessUrl}</a></p>
        </div>
      </div>
    </body>
  </html>`;
}

async function sendPulseAccessEmail(params: {
  email: string;
  name: string;
  accessUrl: string;
  mode: PulseAccessMode;
}) {
  const zeptoMailToken = process.env.ZEPTOMAIL_SEND_MAIL_TOKEN;
  const zeptoMailApiUrl = process.env.ZEPTOMAIL_API_URL || 'https://api.zeptomail.com/v1.1/email';
  const from = process.env.SMTP_FROM || 'pulse@tuweb-ai.com';
  const replyTo = process.env.EMAIL_REPLY_TO || 'pulse@tuweb-ai.com';
  const fromName = process.env.EMAIL_FROM_NAME || 'Pulse by TuWebAI';

  if (!zeptoMailToken) {
    throw new Error('PULSE_ACCESS_EMAIL_CONFIG_MISSING');
  }

  const copy = getPulseAccessCopy(params.mode);
  const response = await fetch(zeptoMailApiUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Zoho-enczapikey ${zeptoMailToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: { address: from, name: fromName },
      to: [{ email_address: { address: params.email, name: params.name } }],
      reply_to: [{ address: replyTo, name: fromName }],
      subject: copy.subject,
      htmlbody: buildHtml(params),
      track_clicks: false,
      track_opens: false,
      client_reference: `pulse-access:${params.mode}:${params.email}`,
    }),
  });

  if (!response.ok) {
    throw new Error(`PULSE_ACCESS_EMAIL_FAILED:${response.status}`);
  }
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
