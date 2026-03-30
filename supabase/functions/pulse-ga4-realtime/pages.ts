interface RealtimeRow {
  dimensionValues?: Array<{ value?: string }>;
  metricValues?: Array<{ value?: string }>;
}

interface PulseRealtimePage {
  label: string;
  path?: string;
  activeUsers: number;
  views: number;
}

interface PulsePageRule {
  label: string;
  path: string;
  patterns: RegExp[];
}

const HIDDEN_PAGE_LABELS = new Set(['', '(not set)', '(other)']);
const BRAND_SEGMENTS = ['tuweb.ai', 'tuwebai'];
const INTERNAL_PAGE_PATTERNS = [/panel de usuario/i, /dashboard/i, /login/i];
const PULSE_PAGE_RULES: PulsePageRule[] = [
  {
    label: 'Inicio',
    path: '/',
    patterns: [/desarrollo web profesional para negocios argentinos/i, /^inicio$/i, /^home$/i],
  },
  {
    label: 'Nosotros',
    path: '/nosotros',
    patterns: [/nosotros/i, /quienes somos/i, /sobre nosotros/i],
  },
  {
    label: 'Soluciones corporativas',
    path: '/corporativos',
    patterns: [/corporativos/i, /empresas/i, /soluciones corporativas/i],
  },
  {
    label: 'Blog',
    path: '/blog',
    patterns: [/^blog$/i, /blog tuweb/i, /articulos/i],
  },
  {
    label: 'Contacto',
    path: '/contacto',
    patterns: [/contacto/i, /consulta/i, /propuesta inicial/i],
  },
  {
    label: 'Política de cookies',
    path: '/politica-de-cookies',
    patterns: [/politica de cookies/i, /política de cookies/i],
  },
];

function cleanPageSegment(segment: string) {
  return segment.trim();
}

function isBrandSegment(segment: string) {
  return BRAND_SEGMENTS.some((brand) => segment.toLowerCase() === brand);
}

function normalizePageLabel(rawLabel: string) {
  const trimmed = rawLabel.trim();

  if (!trimmed || HIDDEN_PAGE_LABELS.has(trimmed.toLowerCase())) {
    return null;
  }

  if (INTERNAL_PAGE_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return null;
  }

  const segments = trimmed
    .split('|')
    .map(cleanPageSegment)
    .filter(Boolean)
    .filter((segment) => !isBrandSegment(segment));

  const candidate = segments[0] || trimmed;
  const mappedRule = PULSE_PAGE_RULES.find((rule) => rule.patterns.some((pattern) => pattern.test(candidate)));

  if (mappedRule) {
    return mappedRule;
  }

  if (segments.length === 0) {
    return { label: 'Inicio', path: '/' };
  }

  if (segments.length === 1) {
    return { label: segments[0] };
  }

  return { label: segments[0] };
}

export function buildRealtimePages(rows: RealtimeRow[]) {
  const pages = new Map<string, PulseRealtimePage>();

  rows.forEach((row) => {
    const resolved = normalizePageLabel(row.dimensionValues?.[0]?.value || '');

    if (!resolved) {
      return;
    }

    const previous = pages.get(resolved.label);
    pages.set(resolved.label, {
      label: resolved.label,
      path: previous?.path ?? resolved.path,
      activeUsers: (previous?.activeUsers || 0) + parseInt(row.metricValues?.[0]?.value || '0', 10),
      views: (previous?.views || 0) + parseInt(row.metricValues?.[1]?.value || '0', 10),
    });
  });

  return Array.from(pages.values())
    .filter((page) => page.activeUsers > 0 || page.views > 0)
    .sort((left, right) => right.activeUsers - left.activeUsers || right.views - left.views)
    .slice(0, 5);
}
