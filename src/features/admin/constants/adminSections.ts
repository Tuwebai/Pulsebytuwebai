export const ADMIN_OPERATIONAL_SECTION_IDS = [
  'dashboard',
  'usuarios',
  'proyectos',
  'tickets',
  'pagos',
  'notifications',
  'settings',
] as const;

export const ADMIN_SECTION_IDS = [...ADMIN_OPERATIONAL_SECTION_IDS] as const;

export type AdminSectionId = (typeof ADMIN_SECTION_IDS)[number];

export const DEFAULT_ADMIN_SECTION: AdminSectionId = 'dashboard';

export const ADMIN_SECTION_LABELS: Record<AdminSectionId, string> = {
  dashboard: 'Dashboard',
  usuarios: 'Usuarios',
  proyectos: 'Proyectos',
  tickets: 'Tickets',
  pagos: 'Pagos',
  notifications: 'Notificaciones',
  settings: 'Ajustes',
};

export function isAdminSectionId(value: string): value is AdminSectionId {
  return (ADMIN_SECTION_IDS as readonly string[]).includes(value);
}

export function getAdminSectionFromRouteSegment(segment?: string | null): AdminSectionId {
  const normalizedSegment = (segment ?? '').trim();

  if (!normalizedSegment) {
    return DEFAULT_ADMIN_SECTION;
  }

  return isAdminSectionId(normalizedSegment) ? normalizedSegment : DEFAULT_ADMIN_SECTION;
}

export function getAdminSectionLabel(sectionId: AdminSectionId): string {
  return ADMIN_SECTION_LABELS[sectionId];
}

export function isOperationalAdminSectionId(
  value: AdminSectionId,
): value is (typeof ADMIN_OPERATIONAL_SECTION_IDS)[number] {
  return (ADMIN_OPERATIONAL_SECTION_IDS as readonly string[]).includes(value);
}
