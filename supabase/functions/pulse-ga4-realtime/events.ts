interface RealtimeRow {
  dimensionValues?: Array<{ value?: string }>;
  metricValues?: Array<{ value?: string }>;
}

export interface RealtimeEventSummary {
  name: string;
  count: number;
  keyEvents: number;
  priority: number;
}

const HIDDEN_EVENTS = new Set(['(other)', 'scroll', 'web_vitals']);

const EVENT_COPY: Record<string, { label: string; priority: number }> = {
  click_cta: { label: 'Clics en contacto', priority: 1 },
  click_whatsapp: { label: 'Clics en WhatsApp', priority: 1 },
  whatsapp_click: { label: 'Clics en WhatsApp', priority: 1 },
  click_phone: { label: 'Clics en llamada', priority: 1 },
  phone_click: { label: 'Clics en llamada', priority: 1 },
  click_email: { label: 'Clics en email', priority: 1 },
  email_click: { label: 'Clics en email', priority: 1 },
  generate_lead: { label: 'Consultas enviadas', priority: 1 },
  submit_form: { label: 'Consultas enviadas', priority: 1 },
  form_submit: { label: 'Consultas enviadas', priority: 1 },
  contact_form_submit: { label: 'Consultas enviadas', priority: 1 },
  page_view: { label: 'Páginas vistas', priority: 2 },
  section_view: { label: 'Secciones vistas', priority: 2 },
  session_start: { label: 'Nuevas sesiones', priority: 2 },
  first_visit: { label: 'Primeras visitas', priority: 3 },
  user_engagement: { label: 'Interacción activa', priority: 3 },
  file_download: { label: 'Descargas', priority: 3 },
};

function humanizeFallbackEventName(name: string) {
  return name
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function normalizeRealtimeEvent(rawName: string) {
  const name = rawName.trim().toLowerCase();

  if (!name || HIDDEN_EVENTS.has(name)) {
    return null;
  }

  const mapped = EVENT_COPY[name];

  if (mapped) {
    return mapped;
  }

  return {
    label: humanizeFallbackEventName(name),
    priority: 4,
  };
}

export function buildRealtimeEvents(rows: RealtimeRow[]) {
  return rows
    .map((row) => {
      const rawName = row.dimensionValues?.[0]?.value || 'evento';
      const normalized = normalizeRealtimeEvent(rawName);

      if (!normalized) {
        return null;
      }

      return {
        name: normalized.label,
        count: parseInt(row.metricValues?.[0]?.value || '0', 10),
        keyEvents: parseInt(row.metricValues?.[1]?.value || '0', 10),
        priority: normalized.priority,
      } satisfies RealtimeEventSummary;
    })
    .filter((event): event is RealtimeEventSummary => Boolean(event) && event.count > 0)
    .sort((left, right) => left.priority - right.priority || right.count - left.count);
}

export function getEventCount(events: RealtimeEventSummary[], labels: string[]) {
  const labelSet = new Set(labels);

  return events.reduce((total, event) => total + (labelSet.has(event.name) ? event.count : 0), 0);
}
