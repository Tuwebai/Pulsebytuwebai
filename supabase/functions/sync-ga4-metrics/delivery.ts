import { type ConsultationAlertRecipient } from './types.ts';

interface ConsultationEmailPayload {
  recipient: ConsultationAlertRecipient;
  domain: string | null;
  consultations: number;
  date: string;
}

const DASHBOARD_URL = 'https://pulse.tuweb-ai.com/dashboard/pulse';
const SETTINGS_URL = 'https://pulse.tuweb-ai.com/dashboard/configuracion';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getConsultationEmailSubject(payload: ConsultationEmailPayload): string {
  return payload.consultations === 1
    ? 'Nueva consulta detectada en tu web'
    : `${payload.consultations} consultas nuevas detectadas en tu web`;
}

function getConsultationEmailHtml(payload: ConsultationEmailPayload): string {
  const safeName = escapeHtml(payload.recipient.full_name || 'cliente');
  const safeDomain = escapeHtml(payload.domain || 'tu sitio web');
  const summary =
    payload.consultations === 1
      ? 'Pulse detectó una nueva consulta en tu web.'
      : `Pulse detectó ${payload.consultations} consultas nuevas en tu web.`;

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${getConsultationEmailSubject(payload)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#0B0F1E;color:#F0F4FF;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0B0F1E;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;">
            <tr>
              <td style="padding-bottom:20px;color:#8B9AC0;font-family:Arial, Helvetica, sans-serif;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;">
                PULSE · by TuWebAI
              </td>
            </tr>
            <tr>
              <td style="background-color:#111827;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:32px 28px;font-family:Arial, Helvetica, sans-serif;">
                <p style="margin:0 0 12px;font-size:24px;line-height:1.4;color:#F0F4FF;">Hola ${safeName},</p>
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:#8B9AC0;">
                  ${summary}
                </p>
                <p style="margin:0 0 24px;font-size:14px;line-height:1.7;color:#C7D2FE;">
                  Sitio: ${safeDomain}<br />
                  Fecha detectada: ${escapeHtml(payload.date)}
                </p>
                <div style="margin:0 0 24px;padding:20px;border-radius:12px;background-color:rgba(59,158,245,0.10);border:1px solid rgba(59,158,245,0.25);text-align:center;">
                  <div style="font-size:42px;line-height:1;font-weight:300;font-family:'JetBrains Mono','Courier New',monospace;color:#F0F4FF;">
                    ${payload.consultations}
                  </div>
                  <div style="margin-top:8px;font-size:13px;color:#8B9AC0;">
                    ${payload.consultations === 1 ? 'consulta nueva' : 'consultas nuevas'}
                  </div>
                </div>
                <div style="text-align:center;padding-bottom:20px;">
                  <a href="${DASHBOARD_URL}" style="display:inline-block;background-color:#3B9EF5;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:500;">
                    Ver Pulse
                  </a>
                </div>
                <p style="margin:0;padding-top:20px;border-top:1px solid rgba(255,255,255,0.08);color:#8B9AC0;font-size:12px;line-height:1.7;">
                  Si preferís no recibir estos avisos por correo, podés ajustar tus preferencias en
                  <a href="${SETTINGS_URL}" style="color:#3B9EF5;text-decoration:none;">Configuración</a>.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export async function sendConsultationAlertEmail(payload: ConsultationEmailPayload): Promise<void> {
  if (Deno.env.get('GA4_CONSULTATION_EMAILS_ENABLED') !== 'true') {
    return;
  }

  const zeptoMailToken = Deno.env.get('ZEPTOMAIL_SEND_MAIL_TOKEN');
  const zeptoMailApiUrl = Deno.env.get('ZEPTOMAIL_API_URL') || 'https://api.zeptomail.com/v1.1/email';
  const from = Deno.env.get('SMTP_FROM') || 'pulse@tuweb-ai.com';
  const replyTo = Deno.env.get('EMAIL_REPLY_TO') || 'pulse@tuweb-ai.com';
  const fromName = Deno.env.get('EMAIL_FROM_NAME') || 'Pulse by TuWebAI';

  if (!zeptoMailToken || !payload.recipient.email) {
    return;
  }

  const response = await fetch(zeptoMailApiUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Zoho-enczapikey ${zeptoMailToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: {
        address: from,
        name: fromName,
      },
      to: [
        {
          email_address: {
            address: payload.recipient.email,
            name: payload.recipient.full_name || 'cliente',
          },
        },
      ],
      reply_to: [
        {
          address: replyTo,
          name: fromName,
        },
      ],
      subject: getConsultationEmailSubject(payload),
      htmlbody: getConsultationEmailHtml(payload),
      track_clicks: false,
      track_opens: false,
      client_reference: `consultation-alert:${payload.recipient.id}:${payload.date}`,
    }),
  });

  if (!response.ok) {
    throw new Error(`ZeptoMail devolvio ${response.status}: ${await response.text()}`);
  }
}
