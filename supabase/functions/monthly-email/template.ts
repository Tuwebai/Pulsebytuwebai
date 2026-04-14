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
      <td style="padding: 0 18px 18px; color: ${color}; font-size: 13px; font-weight: 700;">
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
              <td style="padding-bottom: 14px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td width="25%" style="height: 5px; background-color: #3B9EF5; font-size: 0; line-height: 0;">&nbsp;</td>
                    <td width="25%" style="height: 5px; background-color: #7B4CD4; font-size: 0; line-height: 0;">&nbsp;</td>
                    <td width="25%" style="height: 5px; background-color: #E040A0; font-size: 0; line-height: 0;">&nbsp;</td>
                    <td width="25%" style="height: 5px; background-color: #FF9D00; font-size: 0; line-height: 0;">&nbsp;</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom: 16px; color: #8B9AC0; font-family: Arial, Helvetica, sans-serif; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase;">
                PULSE BY TUWEBAI
              </td>
            </tr>
            <tr>
              <td style="background-color: #0B0F1E; border: 1px solid #1E293B; border-radius: 24px; padding: 0; font-family: Arial, Helvetica, sans-serif;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding: 30px 28px 22px; background-color: #0B0F1E; border-radius: 24px 24px 0 0;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td valign="top" style="padding-right: 16px;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 14px;">
                              <tr>
                                <td align="center" valign="middle" width="34" height="34" style="border: 1px solid #52627D; border-radius: 17px; color: #FFFFFF; font-size: 18px; line-height: 1; font-weight: 700;">
                                  P
                                </td>
                              </tr>
                            </table>
                            <div style="padding-bottom: 10px; color: #8B9AC0; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;">
                              Resumen mensual
                            </div>
                            <div style="padding-bottom: 12px; font-size: 28px; line-height: 1.25; color: #F0F4FF; font-weight: 700;">
                              Tu web en ${safeMonthName}
                            </div>
                            <div style="font-size: 15px; line-height: 1.65; color: #8B9AC0;">
                              Hola ${safeName}, este resumen usa el mismo lenguaje visual que tus comprobantes de pago para que revises resultados y contexto con una presentación consistente en Pulse.
                            </div>
                          </td>
                          <td width="176" valign="top">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #111827; border: 1px solid #1E293B; border-radius: 18px;">
                              <tr>
                                <td style="padding: 18px 18px 8px; color: #8B9AC0; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;">
                                  Total del mes
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 0 18px 8px; color: #F0F4FF; font-size: 30px; line-height: 1; font-weight: 700; font-family: 'JetBrains Mono', 'Courier New', monospace;">
                                  ${payload.visits}
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 0 18px 12px; color: #8B9AC0; font-size: 12px;">
                                  visitas registradas
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 0 18px 18px;">
                                  <span style="display: inline-block; background-color: #3B9EF5; color: #FFFFFF; border-radius: 999px; padding: 6px 12px; font-size: 11px; font-weight: 700;">
                                    ${payload.contacts} consultas
                                  </span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 28px 24px; background-color: #0B0F1E;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td width="50%" valign="top" style="padding: 0 10px 20px 0;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FCFDFF; border: 1px solid #DBE8FB; border-radius: 16px;">
                              <tr>
                                <td style="padding: 18px 18px 6px; color: #64748B; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;">
                                  Tráfico
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 0 18px 8px; color: #0B0F1E; font-size: 38px; line-height: 1; font-weight: 700; font-family: 'JetBrains Mono', 'Courier New', monospace;">
                                  ${payload.visits}
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 0 18px 8px; color: #475569; font-size: 14px; line-height: 1.5;">
                                  Visitas registradas para ${safeDomain}.
                                </td>
                              </tr>
                              ${deltaRow}
                            </table>
                          </td>
                          <td width="50%" valign="top" style="padding: 0 0 20px 10px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FCFDFF; border: 1px solid #DBE8FB; border-radius: 16px;">
                              <tr>
                                <td style="padding: 18px 18px 6px; color: #64748B; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;">
                                  Oportunidades
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 0 18px 8px; color: #0B0F1E; font-size: 38px; line-height: 1; font-weight: 700; font-family: 'JetBrains Mono', 'Courier New', monospace;">
                                  ${payload.contacts}
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 0 18px 22px; color: #475569; font-size: 14px; line-height: 1.5;">
                                  Consultas generadas durante ${safeMonthName}.
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 28px 24px; background-color: #0B0F1E;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FCFDFF; border: 1px solid #DBE8FB; border-radius: 16px;">
                        <tr>
                          <td style="padding: 18px 18px 6px; color: #64748B; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;">
                            Lectura rápida
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 0 18px 18px; color: #334155; font-size: 14px; line-height: 1.7;">
                            Pulse resume este período con la misma estética de tus comprobantes para que puedas pasar de pagos a resultados sin cambiar de contexto visual.
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 0 28px 28px; background-color: #0B0F1E;">
                      <a href="${DASHBOARD_URL}" style="display: inline-block; background-color: #3B9EF5; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 999px; font-size: 14px; font-weight: 700;">
                        Ver mi dashboard →
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 28px 28px; background-color: #0B0F1E; border-radius: 0 0 24px 24px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #111827; border-radius: 16px;">
                        <tr>
                          <td style="padding: 18px 18px 6px; color: #93C5FD; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700;">
                            Pulse by TuWebAI
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 0 18px 18px; color: #8B9AC0; font-size: 12px; line-height: 1.7;">
                            Pulse traduce métricas y movimientos a lenguaje claro para que revises contexto, resultados y próximos pasos desde un mismo sistema visual.
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
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
