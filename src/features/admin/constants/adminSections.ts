export const ADMIN_SECTION_IDS = [
  'dashboard',
  'usuarios',
  'proyectos',
  'aprobar-proyectos',
  'tickets',
  'pagos',
  'advanced-analytics',
  'automation',
  'auto-version',
  'advanced-tools',
  'version-management',
  'advanced-charts',
  'notifications',
  'integraciones',
  'settings',
] as const;

export type AdminSectionId = (typeof ADMIN_SECTION_IDS)[number];

export const DEFAULT_ADMIN_SECTION: AdminSectionId = 'dashboard';

export function isAdminSectionId(value: string): value is AdminSectionId {
  return (ADMIN_SECTION_IDS as readonly string[]).includes(value);
}

export function getAdminSectionFromHash(hash: string): AdminSectionId {
  const normalizedHash = hash.replace(/^#/, '').trim();

  if (!normalizedHash) {
    return DEFAULT_ADMIN_SECTION;
  }

  return isAdminSectionId(normalizedHash) ? normalizedHash : DEFAULT_ADMIN_SECTION;
}
