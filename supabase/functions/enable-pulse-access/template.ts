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
  const intro =
    payload.mode === 'welcome'
      ? 'Ya tenés tu acceso listo para entrar a Pulse y seguir la operación de tu web con TuWebAI.'
      : 'Te enviamos un nuevo enlace para volver a entrar a Pulse y retomar el seguimiento de tu web.';

  const helper =
    payload.mode === 'welcome'
      ? 'Cuando entres, Pulse te va a llevar a tu espacio y, si todavía corresponde, al onboarding inicial.'
      : 'Este enlace te permite retomar el acceso sin fricción desde el correo principal del cliente.';

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
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;">
            <tr>
              <td style="height:2px;background:linear-gradient(135deg,#3B9EF5 0%,#7B4CD4 40%,#E040A0 75%,#FF9D00 100%);border-radius:999px;"></td>
            </tr>
            <tr>
              <td style="padding:20px 0 18px;color:#8B9AC0;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;">
                Pulse · by TuWebAI
              </td>
            </tr>
            <tr>
              <td style="background-color:#111827;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px 28px;font-family:Arial,Helvetica,sans-serif;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding-bottom:12px;font-size:24px;line-height:1.4;color:#F0F4FF;">
                      Hola ${safeName},
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:16px;font-size:16px;line-height:1.7;color:#8B9AC0;">
                      ${intro}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:24px;font-size:14px;line-height:1.7;color:#8B9AC0;">
                      ${helper}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:28px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#1A2234;border:1px solid rgba(59,158,245,0.20);border-radius:14px;">
                        <tr>
                          <td style="padding:18px 18px 6px;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:#3B9EF5;">
                            Acceso Pulse
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:0 18px 18px;font-size:14px;line-height:1.7;color:#F0F4FF;">
                            Un único espacio para seguir clientes, proyecto y operación junto a TuWebAI.
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding-bottom:28px;">
                      <a href="${safeAccessUrl}" style="display:inline-block;background-color:#3B9EF5;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:500;">
                        Abrir Pulse →
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="border-top:1px solid rgba(255,255,255,0.08);padding-top:18px;color:#8B9AC0;font-size:12px;line-height:1.7;">
                      Pulse by TuWebAI · pulse.tuweb-ai.com
                      <br />
                      Si necesitás ayuda, respondé este correo o escribinos a hola@tuweb-ai.com.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
