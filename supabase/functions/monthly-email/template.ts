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
  deltaVisits: number;
  deltaContacts: number;
  consultationRate: number;
  deltaConsultationRate: number;
  dailyAverageVisits: number;
  deltaDailyAverageVisits: number;
  domain: string | null;
  topPages: MonthlyEmailTopPage[];
}

const DASHBOARD_URL = 'https://pulse.tuweb-ai.com/dashboard';
const SETTINGS_URL = 'https://pulse.tuweb-ai.com/dashboard/configuracion';
const LOGO_URL = 'https://pulse.tuweb-ai.com/pulse-icon-96.png';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDeltaLabel(delta: number): string {
  const positive = delta >= 0;
  const color = positive ? '#22C55E' : '#EF4444';
  const icon = positive ? '▲' : '▼';

  return `<span style="color: ${color}; font-size: 13px; font-weight: 700;">${icon} ${Math.abs(delta)}% vs mes anterior</span>`;
}

function formatNumber(value: number): string {
  return value.toLocaleString('es-AR');
}

function formatPercentage(value: number): string {
  return `${value.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

function formatTopPages(topPages: MonthlyEmailTopPage[]): string {
  if (topPages.length === 0) {
    return `
      <tr>
        <td style="padding: 0 20px 20px; color: #475569; font-size: 14px; line-height: 1.6;">
          Todavía no hay páginas destacadas para mostrar en este período.
        </td>
      </tr>
    `;
  }

  const visiblePages = topPages.slice(0, 3);

  return visiblePages
    .map((page, index) => {
      const safeLabel = escapeHtml(page.label || page.path || '/');
      const safePath = escapeHtml(page.path || '/');
      const border = index === visiblePages.length - 1 ? 'transparent' : '#E2E8F0';

      return `
        <tr>
          <td style="padding: 0 20px; border-bottom: 1px solid ${border};">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="padding: 16px 0 6px; color: #0B0F1E; font-size: 15px; line-height: 1.4; font-weight: 700;">
                  ${safeLabel}
                </td>
              </tr>
              <tr>
                <td style="padding: 0 0 4px; color: #64748B; font-size: 13px; line-height: 1.5;">
                  ${safePath}
                </td>
              </tr>
              <tr>
                <td style="padding: 0 0 16px; color: #334155; font-size: 13px; line-height: 1.5;">
                  ${formatNumber(page.visits)} visitas · ${formatPercentage(page.percentage)} del interés del mes
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    })
    .join('');
}

function buildIntro(payload: MonthlyEmailPayload): string {
  const domain = payload.domain || 'tu web';

  if (payload.contacts > 0) {
    return `Hola ${payload.name}, este es tu resumen de ${payload.monthName} para entender cómo respondió ${domain} y qué oportunidades se movieron mejor.`;
  }

  return `Hola ${payload.name}, este es tu resumen de ${payload.monthName} para seguir el movimiento de ${domain} y detectar dónde estuvo el mayor interés.`;
}

function renderMetricCard(input: { title: string; value: string; detail: string; delta: number }): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FCFDFF; border: 1px solid #DBE8FB; border-radius: 18px;">
      <tr>
        <td style="padding: 20px 20px 8px; color: #64748B; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;">
          ${input.title}
        </td>
      </tr>
      <tr>
        <td style="padding: 0 20px 8px; color: #0B0F1E; font-size: 34px; line-height: 1.1; font-weight: 700; font-family: 'JetBrains Mono', 'Courier New', monospace;">
          ${input.value}
        </td>
      </tr>
      <tr>
        <td style="padding: 0 20px 10px; color: #475569; font-size: 14px; line-height: 1.6;">
          ${input.detail}
        </td>
      </tr>
      <tr>
        <td style="padding: 0 20px 20px;">
          ${formatDeltaLabel(input.delta)}
        </td>
      </tr>
    </table>
  `;
}

export function generateMonthlyEmailSubject(payload: MonthlyEmailPayload): string {
  return `Tu web en ${payload.monthName}: ${payload.visits} visitas${payload.contacts > 0 ? ` y ${payload.contacts} consultas` : ''}`;
}

export function generateMonthlyEmailHtml(payload: MonthlyEmailPayload): string {
  const safeMonthName = escapeHtml(payload.monthName);
  const safeDomain = payload.domain ? escapeHtml(payload.domain) : 'tu web';
  const intro = escapeHtml(buildIntro(payload));
  const topPagesRows = formatTopPages(payload.topPages);

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${generateMonthlyEmailSubject(payload)}</title>
    <meta name="color-scheme" content="dark" />
    <meta name="supported-color-schemes" content="dark" />
  </head>
  <body style="margin: 0; padding: 0; background-color: #0B0F1E; color: #F0F4FF;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #0B0F1E;">
      <tr>
        <td align="center" style="padding: 24px 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 620px;">
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
              <td style="padding-bottom: 14px; color: #8B9AC0; font-family: Arial, Helvetica, sans-serif; font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase;">
                Pulse by TuWebAI
              </td>
            </tr>
            <tr>
              <td style="border: 1px solid #1E293B; border-radius: 24px; background-color: #0B0F1E; font-family: Arial, Helvetica, sans-serif; overflow: hidden;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="padding: 28px 24px 22px;">
                      <img src="${LOGO_URL}" alt="Pulse" width="48" height="48" style="display: block; width: 48px; height: 48px; border: 0; margin-bottom: 18px;" />
                      <div style="padding-bottom: 10px; color: #8B9AC0; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;">
                        Resumen mensual
                      </div>
                      <div style="padding-bottom: 12px; color: #F0F4FF; font-size: 24px; line-height: 1.3; font-weight: 700;">
                        Tu web en ${safeMonthName}
                      </div>
                      <div style="color: #8B9AC0; font-size: 15px; line-height: 1.7;">
                        ${intro}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 16px 8px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="padding: 0 8px 16px;">
                            ${renderMetricCard({
                              title: 'Visitas registradas',
                              value: formatNumber(payload.visits),
                              detail: `Movimiento total detectado en ${safeDomain}.`,
                              delta: payload.deltaVisits,
                            })}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 0 8px 16px;">
                            ${renderMetricCard({
                              title: 'Consultas recibidas',
                              value: formatNumber(payload.contacts),
                              detail: `Contactos generados durante ${safeMonthName}.`,
                              delta: payload.deltaContacts,
                            })}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 0 8px 16px;">
                            ${renderMetricCard({
                              title: 'Tasa de consulta',
                              value: formatPercentage(payload.consultationRate),
                              detail: 'Relación entre visitas y consultas del mes.',
                              delta: payload.deltaConsultationRate,
                            })}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 0 8px 16px;">
                            ${renderMetricCard({
                              title: 'Promedio diario',
                              value: formatNumber(payload.dailyAverageVisits),
                              detail: 'Promedio de visitas por día durante el mes.',
                              delta: payload.deltaDailyAverageVisits,
                            })}
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 24px 24px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FCFDFF; border: 1px solid #DBE8FB; border-radius: 18px;">
                        <tr>
                          <td style="padding: 20px 20px 8px; color: #64748B; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;">
                            Páginas más visitadas
                          </td>
                        </tr>
                        ${topPagesRows}
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding: 0 24px 24px;">
                      <a href="${DASHBOARD_URL}" style="display: inline-block; background-color: #3B9EF5; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 999px; font-size: 14px; font-weight: 700;">
                        Ver mi panel →
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 24px 24px;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #111827; border-radius: 16px;">
                        <tr>
                          <td style="padding: 18px 18px 6px; color: #93C5FD; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; font-weight: 700;">
                            Pulse by TuWebAI
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 0 18px 18px; color: #8B9AC0; font-size: 12px; line-height: 1.7;">
                            Cada mes te acercamos una lectura clara para que entiendas cómo viene tu web y qué páginas están generando más interés.
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
