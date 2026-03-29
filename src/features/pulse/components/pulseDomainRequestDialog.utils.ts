interface DialogMetaParams {
  hasReachedLimit: boolean;
  status: 'missing' | 'pending_review' | 'approved' | 'rejected';
}

export function getPulseDomainRequestDialogTitle({ hasReachedLimit, status }: DialogMetaParams) {
  if (status === 'pending_review') return 'Estamos revisando tu dominio';
  if (status === 'approved') return 'Tu dominio ya quedó confirmado';
  if (hasReachedLimit) return 'Sigamos este cambio con el equipo';
  return status === 'rejected' ? 'Reenviar dominio' : 'Enviar dominio';
}

export function getPulseDomainRequestDialogDescription({ hasReachedLimit, status }: DialogMetaParams) {
  if (status === 'pending_review') {
    return 'Ya recibimos tu dominio. Cuando quede confirmado, Pulse va a terminar de preparar la conexión para mostrarte datos reales.';
  }

  if (status === 'approved') {
    return 'Tu dominio ya está confirmado. Si todavía no ves datos, estamos terminando de conectarlo a Pulse.';
  }

  if (hasReachedLimit) {
    return 'Por ahora este ajuste lo seguimos con nuestro equipo. Si necesitás corregir algo, escribinos y te ayudamos a dejarlo listo.';
  }

  return status === 'rejected'
    ? 'Podés reenviar una versión corregida del dominio. Cuando quede confirmada, seguimos con la conexión de tus datos.'
    : 'Escribí tu dominio y lo revisamos antes de conectarlo a Pulse.';
}
