interface DialogMetaParams {
  hasReachedLimit: boolean;
  status: 'missing' | 'pending_review' | 'approved' | 'rejected';
}

export function getPulseDomainRequestDialogTitle({ hasReachedLimit, status }: DialogMetaParams) {
  if (status === 'pending_review') return 'Tu dominio está en revisión';
  if (status === 'approved') return 'Tu dominio ya está aprobado';
  if (hasReachedLimit) return 'Sigamos este cambio con nuestro equipo';
  return status === 'rejected' ? 'Corregir dominio' : 'Compartir dominio';
}

export function getPulseDomainRequestDialogDescription({ hasReachedLimit, status }: DialogMetaParams) {
  if (status === 'pending_review') {
    return 'Ya recibimos tu web. Nuestro equipo la está validando para dejar Pulse listo con tus datos reales.';
  }

  if (status === 'approved') {
    return 'Tu dominio ya quedó aprobado. Si todavía no ves datos, estamos terminando la conexión para mostrarte movimiento real en Pulse.';
  }

  if (hasReachedLimit) {
    return 'Por ahora este ajuste lo seguimos con nuestro equipo. Si necesitás corregir algo, escribinos y te ayudamos a dejarlo listo.';
  }

  return status === 'rejected'
    ? 'Vimos un detalle en el dominio que nos compartiste. Reenviá la versión correcta y seguimos con la conexión.'
    : 'Compartinos tu dominio y lo revisamos antes de mostrar los datos reales de tu web en Pulse.';
}
