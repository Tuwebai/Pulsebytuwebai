interface RealtimeRow {
  dimensionValues?: Array<{ value?: string }>;
  metricValues?: Array<{ value?: string }>;
}

interface PulseRealtimePage {
  label: string;
  activeUsers: number;
  views: number;
}

const HIDDEN_PAGE_LABELS = new Set(['', '(not set)', '(other)']);
const BRAND_SEGMENTS = ['tuweb.ai', 'tuwebai'];
const INTERNAL_PAGE_PATTERNS = [/panel de usuario/i, /dashboard/i, /login/i];

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

  if (segments.length === 0) {
    return 'Inicio';
  }

  if (segments.length === 1) {
    return segments[0];
  }

  return segments[0];
}

export function buildRealtimePages(rows: RealtimeRow[]) {
  const pages = new Map<string, PulseRealtimePage>();

  rows.forEach((row) => {
    const label = normalizePageLabel(row.dimensionValues?.[0]?.value || '');

    if (!label) {
      return;
    }

    const previous = pages.get(label);
    pages.set(label, {
      label,
      activeUsers: (previous?.activeUsers || 0) + parseInt(row.metricValues?.[0]?.value || '0', 10),
      views: (previous?.views || 0) + parseInt(row.metricValues?.[1]?.value || '0', 10),
    });
  });

  return Array.from(pages.values())
    .filter((page) => page.activeUsers > 0 || page.views > 0)
    .sort((left, right) => right.activeUsers - left.activeUsers || right.views - left.views)
    .slice(0, 5);
}
