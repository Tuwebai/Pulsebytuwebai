interface DialogMetaParams {
  hasReachedLimit: boolean;
  status: 'missing' | 'pending_review' | 'approved' | 'rejected';
}

export function getPulseDomainRequestDialogTitle({ hasReachedLimit, status }: DialogMetaParams) {
  if (status === 'pending_review') return 'Tu dominio está en revisión';
  if (status === 'approved') return 'Tu dominio ya fue aprobado';
  if (hasReachedLimit) return 'Ya usamos tus dos envíos';
  return status === 'rejected' ? 'Reenviar dominio' : 'Enviar dominio';
}

export function getPulseDomainRequestDialogDescription({ hasReachedLimit, status }: DialogMetaParams) {
  if (status === 'pending_review') {
    return 'El equipo de TuWebAI ya recibió tu dominio. Cuando lo valide, Pulse va a empezar a preparar la conexión real.';
  }

  if (status === 'approved') {
    return 'Tu dominio ya está validado. Si todavía no ves datos, Pulse está terminando la conexión técnica.';
  }

  if (hasReachedLimit) {
    return 'Por ahora bloqueamos nuevos envíos desde esta cuenta para evitar ruido operativo. Si necesitás corregir algo, escribinos y lo resolvemos con el equipo.';
  }

  return status === 'rejected'
    ? 'Podés reenviar una versión corregida del dominio. Este envío vuelve a quedar pendiente hasta que el admin lo apruebe.'
    : 'Escribí tu dominio y lo dejamos pendiente de validación. El admin lo revisa antes de activarlo en Pulse.';
}
