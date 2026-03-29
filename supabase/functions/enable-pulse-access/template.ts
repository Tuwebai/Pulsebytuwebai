import { getPulseAccessEmailContent } from './template.content.ts';

export interface PulseAccessEmailPayload {
  to: string;
  name: string;
  accessUrl: string;
  mode: 'welcome' | 'reentry';
}
function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
export function generatePulseAccessEmailSubject(payload: PulseAccessEmailPayload): string {
  return payload.mode === 'welcome'
    ? 'Tu acceso a Pulse ya está listo'
    : 'Tu acceso a Pulse fue renovado';
}
export function generatePulseAccessEmailHtml(payload: PulseAccessEmailPayload): string {
  const safeName = escapeHtml(payload.name || 'cliente');
  const safeAccessUrl = escapeHtml(payload.accessUrl);
  const safeRecipient = escapeHtml(payload.to);
  const content = getPulseAccessEmailContent(payload.mode);
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${generatePulseAccessEmailSubject(payload)}</title>
    <meta name="color-scheme" content="dark" />
    <meta name="supported-color-schemes" content="dark" />
  </head>
  <body style="margin:0;padding:0;background-color:#0B0F1E;color:#F0F4FF;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#0B0F1E;">
      <tr>
        <td align="center" style="padding:32px 16px 40px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;">
            <tr>
              <td style="padding-bottom:18px;color:#8B9AC0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;">
                Pulse · by TuWebAI
              </td>
            </tr>
            <tr>
              <td style="height:3px;background:linear-gradient(90deg,#3B9EF5 0%,#7B4CD4 38%,#E040A0 72%,#FF9D00 100%);border-radius:999px;"></td>
            </tr>
            <tr>
              <td style="padding-top:18px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#111827;border:1px solid rgba(255,255,255,0.08);border-radius:20px;">
                  <tr>
                    <td style="padding:32px 30px 30px;font-family:Arial,Helvetica,sans-serif;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="padding-bottom:16px;">
                            <span style="display:inline-block;background-color:rgba(59,158,245,0.12);border:1px solid rgba(59,158,245,0.24);border-radius:999px;padding:7px 12px;color:#8BC6FF;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;">
                              ${content.badge}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom:10px;color:#8B9AC0;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;">
                            ${content.eyebrow}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom:12px;font-size:30px;line-height:1.2;color:#F0F4FF;font-weight:700;">
                            Hola ${safeName},
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom:12px;font-size:24px;line-height:1.35;color:#F0F4FF;font-weight:600;">
                            ${content.title}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom:14px;font-size:16px;line-height:1.75;color:#C9D5F4;">
                            ${content.intro}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom:28px;font-size:14px;line-height:1.75;color:#8B9AC0;">
                            ${content.helper}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom:22px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:linear-gradient(180deg,rgba(26,34,52,0.96) 0%,rgba(17,24,39,0.98) 100%);border:1px solid rgba(255,255,255,0.08);border-radius:16px;">
                              <tr>
                                <td style="padding:20px 20px 8px;color:#F0F4FF;font-size:13px;letter-spacing:0.12em;text-transform:uppercase;">
                                  Qué vas a encontrar en Pulse
                                </td>
                              </tr>
                              <tr>
                                <td style="padding:0 20px 20px;">
                                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                                    <tr>
                                      <td style="padding:8px 0 0;color:#C9D5F4;font-size:14px;line-height:1.65;">
                                        <span style="color:#3B9EF5;">•</span> ${content.highlights[0]}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style="padding:8px 0 0;color:#C9D5F4;font-size:14px;line-height:1.65;">
                                        <span style="color:#3B9EF5;">•</span> ${content.highlights[1]}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td style="padding:8px 0 0;color:#C9D5F4;font-size:14px;line-height:1.65;">
                                        <span style="color:#3B9EF5;">•</span> ${content.highlights[2]}
                                      </td>
                                    </tr>
                                  </table>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-bottom:16px;">
                            <a href="${safeAccessUrl}" style="display:inline-block;min-width:210px;background-color:#3B9EF5;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:12px;font-size:15px;font-weight:700;">
                              ${content.cta}
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-bottom:28px;color:#8B9AC0;font-size:13px;line-height:1.7;">
                            ${content.note}
                          </td>
                        </tr>
                        <tr>
                          <td style="border-top:1px solid rgba(255,255,255,0.08);padding-top:18px;color:#8B9AC0;font-size:12px;line-height:1.75;">
                            Si el botón no abre bien, copiá este enlace en tu navegador:
                            <br />
                            <a href="${safeAccessUrl}" style="color:#8BC6FF;text-decoration:none;word-break:break-all;">${safeAccessUrl}</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-top:18px;color:#65759F;font-size:12px;line-height:1.75;">
                            Pulse by TuWebAI · pulse.tuweb-ai.com
                            <br />
                            Si necesitás ayuda, respondé este correo o escribinos a pulse@tuweb-ai.com.
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding-top:16px;text-align:center;color:#4A5580;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.7;">
                Este correo fue enviado a ${safeRecipient} porque se habilitó tu acceso a Pulse.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
