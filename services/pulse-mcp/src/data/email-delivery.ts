function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
    .replace(/[^\u0000-\u007F]/g, (character) => `&#${character.codePointAt(0)};`);
}

function formatParagraphs(message: string) {
  return message
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.75;color:#C9D5F4;">${escapeHtml(paragraph).replaceAll('\n', '<br />')}</p>`)
    .join('');
}

export function buildPulseBrandedEmailHtml(input: {
  preheader?: string;
  heading: string;
  recipientName?: string | null;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
}) {
  const greetingName = input.recipientName?.trim() || 'cliente';
  const ctaBlock = input.ctaLabel && input.ctaUrl
    ? `<div style="margin:24px 0 0;"><a href="${escapeHtml(input.ctaUrl)}" style="display:inline-block;background:#3B9EF5;color:#FFFFFF;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:700;">${escapeHtml(input.ctaLabel)}</a></div>`
    : '';
  const ctaFallback = input.ctaUrl
    ? `<p style="margin:18px 0 0;font-size:13px;line-height:1.7;color:#8B9AC0;">Si el boton no abre bien, copiá este enlace en tu navegador:<br /><a href="${escapeHtml(input.ctaUrl)}" style="color:#8BC6FF;text-decoration:none;word-break:break-all;">${escapeHtml(input.ctaUrl)}</a></p>`
    : '';
  const footerNote = input.footerNote?.trim()
    ? `<p style="margin:18px 0 0;font-size:13px;line-height:1.7;color:#8B9AC0;">${escapeHtml(input.footerNote).replaceAll('\n', '<br />')}</p>`
    : '';

  return `<!doctype html>
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Pulse by TuWebAI</title>
    </head>
    <body style="margin:0;padding:24px;background:#0B0F1E;color:#F0F4FF;font-family:Arial,Helvetica,sans-serif;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(input.preheader?.trim() || input.heading)}</div>
      <div style="max-width:620px;margin:0 auto;">
        <div style="height:3px;background:linear-gradient(90deg,#3B9EF5 0%,#7B4CD4 38%,#E040A0 72%,#FF9D00 100%);border-radius:999px;"></div>
        <div style="margin-top:18px;padding:28px;background:#111827;border:1px solid rgba(255,255,255,0.08);border-radius:20px;">
          <div style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#8B9AC0;">Pulse by TuWebAI</div>
          <h1 style="margin:12px 0 10px;font-size:28px;line-height:1.2;color:#F0F4FF;">Hola ${escapeHtml(greetingName)},</h1>
          <h2 style="margin:0 0 16px;font-size:22px;line-height:1.35;color:#F0F4FF;">${escapeHtml(input.heading)}</h2>
          ${formatParagraphs(input.message)}
          ${ctaBlock}
          ${ctaFallback}
          ${footerNote}
        </div>
      </div>
    </body>
  </html>`;
}

export async function sendPulseEmail(input: {
  toEmail: string;
  toName?: string | null;
  subject: string;
  htmlbody: string;
  clientReference: string;
}) {
  const zeptoMailToken = process.env.ZEPTOMAIL_SEND_MAIL_TOKEN;
  const zeptoMailApiUrl = process.env.ZEPTOMAIL_API_URL || 'https://api.zeptomail.com/v1.1/email';
  const from = process.env.SMTP_FROM || 'pulse@tuweb-ai.com';
  const replyTo = process.env.EMAIL_REPLY_TO || 'pulse@tuweb-ai.com';
  const fromName = process.env.EMAIL_FROM_NAME || 'Pulse by TuWebAI';

  if (!zeptoMailToken) {
    throw new Error('Falta ZEPTOMAIL_SEND_MAIL_TOKEN para enviar emails desde Pulse.');
  }

  const response = await fetch(zeptoMailApiUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Zoho-enczapikey ${zeptoMailToken}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      from: { address: from, name: fromName },
      to: [{ email_address: { address: input.toEmail, name: input.toName || input.toEmail } }],
      reply_to: [{ address: replyTo, name: fromName }],
      subject: input.subject,
      htmlbody: input.htmlbody,
      track_clicks: false,
      track_opens: false,
      client_reference: input.clientReference,
    }),
  });

  if (!response.ok) {
    throw new Error(`Pulse no pudo enviar el email. ZeptoMail devolvió ${response.status}.`);
  }

  return {
    provider: 'zeptomail' as const,
    recipient: input.toEmail,
    subject: input.subject,
  };
}
