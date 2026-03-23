export const MOCK_PULSE_DATA = {
  period: 'this_month' as const,
  titleMonth: 'noviembre 2025',
  visits: 847,
  contacts: 23,
  topPage: '/servicios',
  topPageVisits: 312,
  averageTime: '2:34',
  visitsDelta: 12,
  contactsDelta: 8,
  pages: [
    { path: '/', visits: 312, percent: 37 },
    { path: '/servicios', visits: 198, percent: 23 },
    { path: '/contacto', visits: 156, percent: 18 },
    { path: '/nosotros', visits: 89, percent: 11 },
    { path: 'Otras páginas', visits: 92, percent: 11 }
  ],
  recentContacts: [
    { label: 'Formulario de contacto completado', timestamp: 'Hoy 14:32' },
    { label: 'Formulario de contacto completado', timestamp: 'Hoy 11:15' },
    { label: 'Formulario de contacto completado', timestamp: 'Ayer 18:44' }
  ]
} as const;
