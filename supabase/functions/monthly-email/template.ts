export interface MonthlyEmailPayload {
  to: string;
  name: string;
  monthName: string;
  visits: number;
  contacts: number;
  deltaVisits: number | null;
  domain: string | null;
}

const DASHBOARD_URL = 'https://pulse.tuweb-ai.com/dashboard';
const SETTINGS_URL = 'https://pulse.tuweb-ai.com/dashboard/configuracion';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDelta(deltaVisits: number | null): string {
  if (deltaVisits === null) {
    return '';
  }

  const positive = deltaVisits >= 0;
  const label = `${positive ? '▲' : '▼'} ${Math.abs(deltaVisits)}% vs mes anterior`;
  const color = positive ? '#22C55E' : '#EF4444';

  return `
    <tr>
      <td align="center" style="padding-top: 8px; color: ${color}; font-size: 14px; font-weight: 500;">
        ${label}
      </td>
    </tr>
  `;
}

export function generateMonthlyEmailSubject(payload: MonthlyEmailPayload): string {
  return `Tu web en ${payload.monthName}: ${payload.visits} visitas${payload.contacts > 0 ? ` y ${payload.contacts} consultas` : ''}`;
}

export function generateMonthlyEmailHtml(payload: MonthlyEmailPayload): string {
  const safeName = escapeHtml(payload.name || 'cliente');
  const safeMonthName = escapeHtml(payload.monthName);
  const safeDomain = payload.domain ? escapeHtml(payload.domain) : 'tu sitio web';
  const deltaRow = formatDelta(payload.deltaVisits);

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${generateMonthlyEmailSubject(payload)}</title>
    <meta name="color-scheme" content="dark" />
    <meta name="supported-color-schemes" content="dark" />
    <style>
      @media (prefers-color-scheme: dark) {
        body, table, td {
          background-color: #0B0F1E !important;
          color: #F0F4FF !important;
        }
      }
    </style>
  </head>
  <body style="margin: 0; padding: 0; background-color: #0B0F1E; color: #F0F4FF;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0B0F1E;">
      <tr>
        <td align="center" style="padding: 32px 16px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px;">
            <tr>
              <td style="padding-bottom: 20px; color: #8B9AC0; font-family: Arial, Helvetica, sans-serif; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase;">
                PULSE · by TuWebAI
              </td>
            </tr>
            <tr>
              <td style="background-color: #111827; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 32px 28px; font-family: Arial, Helvetica, sans-serif;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding-bottom: 12px; font-size: 24px; line-height: 1.4; color: #F0F4FF;">
                      Hola ${safeName},
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 24px; font-size: 16px; line-height: 1.6; color: #8B9AC0;">
                      En ${safeMonthName} tu web tuvo estos resultados en ${safeDomain}.
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td width="50%" valign="top" style="padding: 0 10px 20px 0;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;">
                              <tr>
                                <td align="center" style="padding: 24px 16px 8px; color: #F0F4FF; font-size: 48px; line-height: 1; font-weight: 300; font-family: 'JetBrains Mono', 'Courier New', monospace;">
                                  ${payload.visits}
                                </td>
                              </tr>
                              <tr>
                                <td align="center" style="padding-bottom: 6px; color: #8B9AC0; font-size: 13px;">
                                  visitas
                                </td>
                              </tr>
                              ${deltaRow}
                            </table>
                          </td>
                          <td width="50%" valign="top" style="padding: 0 0 20px 10px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;">
                              <tr>
                                <td align="center" style="padding: 24px 16px 8px; color: #F0F4FF; font-size: 48px; line-height: 1; font-weight: 300; font-family: 'JetBrains Mono', 'Courier New', monospace;">
                                  ${payload.contacts}
                                </td>
                              </tr>
                              <tr>
                                <td align="center" style="padding-bottom: 22px; color: #8B9AC0; font-size: 13px;">
                                  consultas
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 8px 0 28px;">
                      <a href="${DASHBOARD_URL}" style="display: inline-block; background-color: #3B9EF5; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 500;">
                        Ver mi dashboard →
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="border-top: 1px solid rgba(255,255,255,0.08); padding-top: 20px; color: #8B9AC0; font-size: 12px; line-height: 1.7;">
                      Pulse by TuWebAI · pulse.tuweb-ai.com
                      <br />
                      Para dejar de recibir este resumen, ajustá tus preferencias en
                      <a href="${SETTINGS_URL}" style="color: #3B9EF5; text-decoration: none;">tu panel</a>.
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
