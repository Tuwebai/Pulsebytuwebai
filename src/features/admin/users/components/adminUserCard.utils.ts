export function getWebsiteStatusLabel(status?: string | null, website?: string | null) {
  if (!website) {
    return 'Sin URL';
  }

  switch (status) {
    case 'approved':
      return 'URL aprobada';
    case 'pending_review':
      return 'URL en revisión';
    case 'rejected':
      return 'URL rechazada';
    default:
      return 'URL cargada';
  }
}

export function getWebsiteStatusBadgeClass(status?: string | null, website?: string | null) {
  if (!website) {
    return 'border-white/10 bg-white/[0.06] text-slate-200';
  }

  switch (status) {
    case 'approved':
      return 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100';
    case 'pending_review':
      return 'border-amber-400/30 bg-amber-500/15 text-amber-100';
    case 'rejected':
      return 'border-red-400/30 bg-red-500/15 text-red-100';
    default:
      return 'border-slate-400/20 bg-slate-400/10 text-slate-100';
  }
}

export function getWebsiteActionLabel(status?: string | null, website?: string | null) {
  if (!website) {
    return 'Configurar URL';
  }

  switch (status) {
    case 'approved':
      return 'Editar URL';
    case 'pending_review':
      return 'Revisar URL';
    case 'rejected':
      return 'Corregir URL';
    default:
      return 'Gestionar URL';
  }
}

export function getPulseAccessLabel(status?: string | null) {
  switch (status) {
    case 'active':
      return 'Acceso Pulse activo';
    case 'invited':
      return 'Invitación Pulse enviada';
    case 'disabled':
      return 'Acceso Pulse revocado';
    case 'pending':
      return 'Acceso Pulse pendiente';
    default:
      return 'Sin acceso Pulse';
  }
}

export function getPulseAccessBadgeClass(status?: string | null) {
  switch (status) {
    case 'active':
      return 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100';
    case 'invited':
      return 'border-sky-400/30 bg-sky-500/15 text-sky-100';
    case 'disabled':
      return 'border-red-400/30 bg-red-500/15 text-red-100';
    case 'pending':
      return 'border-amber-400/30 bg-amber-500/15 text-amber-100';
    default:
      return 'border-white/10 bg-white/[0.06] text-slate-200';
  }
}
