export interface MonthlyEmailTopPage {
  label: string | null;
  path: string;
  percentage: number;
  visits: number;
}

export interface MonthlyEmailPayload {
  to: string;
  name: string;
  monthName: string;
  visits: number;
  contacts: number;
  deltaVisits: number | null;
  deltaContacts: number | null;
  avgSessionSec: number | null;
  domain: string | null;
  topPages: MonthlyEmailTopPage[];
}

const DASHBOARD_URL = 'https://pulse.tuweb-ai.com/dashboard';
const SETTINGS_URL = 'https://pulse.tuweb-ai.com/dashboard/configuracion';
const LOGO_DATA_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' role='img' aria-label='Pulse by TuWebAI'%3E%3Ctitle%3EPulse%3C/title%3E%3Cdefs%3E%3CclipPath id='pulse-favicon-clip'%3E%3Ccircle cx='50' cy='50' r='37' /%3E%3C/clipPath%3E%3C/defs%3E%3Ccircle cx='50' cy='50' r='38' fill='none' stroke='%23FFFFFF' stroke-width='1.4' opacity='0.18' /%3E%3Cg clip-path='url(%23pulse-favicon-clip)'%3E%3Cpath d='M12 50 L26 50 L34 26 L44 74 L52 38 L60 50 L88 50' fill='none' stroke='%23FFFFFF' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round' /%3E%3C/g%3E%3Ccircle cx='60' cy='50' r='3' fill='%233B9EF5' /%3E%3C/svg%3E";

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDelta(delta: number | null, tone: 'positive' | 'neutral' = 'positive'): string {
  if (delta === null) {
    return '';
  }

  const positive = delta >= 0;
  const color = positive ? '#22C55E' : '#EF4444';
  const prefix = tone === 'neutral' ? '' : positive ? '▲ ' : '▼ ';
  const sign = positive ? (tone === 'neutral' ? '+' : '') : '';

  return `
    <tr>
      <td style="padding: 0 18px 18px; color: ${color}; font-size: 13px; font-weight: 700;">
        ${prefix}${sign}${Math.abs(delta)}% vs mes anterior
      </td>
    </tr>
  `;
}

function formatSessionDuration(seconds: number | null): string {
  if (!seconds || seconds <= 0) {
    return 'Sin datos suficientes';
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  if (minutes <= 0) {
    return `${remainingSeconds}s`;
  }

  if (remainingSeconds === 0) {
    return `${minutes} min`;
  }

  return `${minutes} min ${remainingSeconds}s`;
}

function formatTopPages(topPages: MonthlyEmailTopPage[]): string {
  if (topPages.length === 0) {
    return `
      <tr>
        <td style="padding: 0 18px 18px; color: #475569; font-size: 14px; line-height: 1.6;">
          Todavía no hay páginas destacadas para mostrar en este período.
        </td>
      </tr>
    `;
  }

  return topPages
    .slice(0, 3)
    .map((page, index) => {
      const safeLabel = escapeHtml(page.label || page.path || '/');
      const safePath = escapeHtml(page.path || '/');
      const divider = index === topPages.slice(0, 3).length - 1 ? 'transparent' : '#E2E8F0';

      return `
        <tr>
          <td style="padding: 0 18px 0; border-bottom: 1px solid ${divider};">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="padding: 14px 0 6px; color: #0B0F1E; font-size: 15px; font-weight: 700;">
                  ${safeLabel}
                </td>
                <td align="right" style="padding: 14px 0 6px; color: #0B0F1E; font-size: 15px; font-weight: 700;">
                  ${page.visits} visitas
                </td>
              </tr>
              <tr>
                <td style="padding: 0 0 14px; color: #64748B; font-size: 13px; line-height: 1.5;">
                  ${safePath}
                </td>
                <td align="right" style="padding: 0 0 14px; color: #64748B; font-size: 13px; line-height: 1.5;">
                  ${page.percentage}% del interés del mes
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    })
    .join('');
}

function buildLeadSummary(payload: MonthlyEmailPayload): string {
  if (payload.contacts === 0) {
    return 'Este mes tu web siguió generando movimiento. Ahora conviene mirar qué páginas concentraron más interés.';
  }

  if (payload.deltaContacts !== null) {
    if (payload.deltaContacts > 0) {
      return `Tus consultas crecieron frente al mes anterior. Es un buen momento para revisar qué contenido está trayendo contactos.`;
    }
  }

  return `Tu web generó ${payload.contacts} consultas en ${payload.monthName}. Tenés una foto clara para seguir de cerca lo que mejor respondió.`;
}

export function generateMonthlyEmailSubject(payload: MonthlyEmailPayload): string {
  return `Tu web en ${payload.monthName}: ${payload.visits} visitas${payload.contacts > 0 ? ` y ${payload.contacts} consultas` : ''}`;
}

export function generateMonthlyEmailHtml(payload: MonthlyEmailPayload): string {
  const safeName = escapeHtml(payload.name || 'cliente');
  const safeMonthName = escapeHtml(payload.monthName);
  const safeDomain = payload.domain ? escapeHtml(payload.domain) : 'tu sitio web';
  const visitsDeltaRow = formatDelta(payload.deltaVisits);
  const contactsDeltaRow = formatDelta(payload.deltaContacts, 'neutral');
  const avgSessionLabel = formatSessionDuration(payload.avgSessionSec);
  const topPagesRows = formatTopPages(payload.topPages);
  const leadSummary = escapeHtml(buildLeadSummary(payload));

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
                Pulse by TuWebAI
              </td>
            </tr>
            <tr>
              <td style="background-color: #0B0F1E; border: 1px solid #1E293B; border-radius: 24px; padding: 0; font-family: Arial, Helvetica, sans-serif;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding: 30px 28px 22px; background-color: #0B0F1E; border-radius: 24px 24px 0 0;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="padding-bottom: 14px;">
                            <img src="${LOGO_DATA_URI}" alt="Pulse" width="40" height="40" style="display: block; width: 40px; height: 40px; border: 0;" />
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom: 10px; color: #8B9AC0; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;">
                            Resumen mensual
                          </td>
                        </tr>
                        <tr>
                          <td style="padding-bottom: 12px; font-size: 28px; line-height: 1.25; color: #F0F4FF; font-weight: 700;">
                            Tu web en ${safeMonthName}
                          </td>
                        </tr>
                        <tr>
                          <td style="font-size: 15px; line-height: 1.7; color: #8B9AC0;">
                            Hola ${safeName}, acá tenés el resumen real de ${safeMonthName} para entender qué pasó en ${safeDomain} y dónde estuvo el mayor interés.
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
                              ${visitsDeltaRow}
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
                                <td style="padding: 0 18px 8px; color: #475569; font-size: 14px; line-height: 1.5;">
                                  Consultas generadas durante ${safeMonthName}.
                                </td>
                              </tr>
                              ${contactsDeltaRow}
                            </table>
                          </td>
                        </tr>
                        <tr>
                          <td width="50%" valign="top" style="padding: 0 10px 0 0;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FCFDFF; border: 1px solid #DBE8FB; border-radius: 16px;">
                              <tr>
                                <td style="padding: 18px 18px 6px; color: #64748B; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;">
                                  Tiempo promedio
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 0 18px 8px; color: #0B0F1E; font-size: 28px; line-height: 1.2; font-weight: 700;">
                                  ${avgSessionLabel}
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 0 18px 18px; color: #475569; font-size: 14px; line-height: 1.5;">
                                  Permanencia promedio por sesión en tu web durante el mes.
                                </td>
                              </tr>
                            </table>
                          </td>
                          <td width="50%" valign="top" style="padding: 0 0 0 10px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #111827; border: 1px solid #1E293B; border-radius: 16px;">
                              <tr>
                                <td style="padding: 18px 18px 6px; color: #93C5FD; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;">
                                  Lectura rápida
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 0 18px 18px; color: #E2E8F0; font-size: 14px; line-height: 1.7;">
                                  ${leadSummary}
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
                            Páginas más visitadas
                          </td>
                        </tr>
                        ${topPagesRows}
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 0 28px 28px; background-color: #0B0F1E;">
                      <a href="${DASHBOARD_URL}" style="display: inline-block; background-color: #3B9EF5; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 999px; font-size: 14px; font-weight: 700;">
                        Ver mi panel →
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
                            Cada mes te acercamos una lectura clara para que entiendas cómo viene tu web y qué páginas están generando más respuesta.
                            <br />
                            Si querés dejar de recibir este resumen, ajustá tus preferencias en
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
