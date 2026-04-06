export interface DomainValidationResult {
  isValid: boolean;
  normalizedDomain: string;
  errorMessage: string | null;
}

export function normalizeDomainInput(input: string): string {
  const trimmed = input.trim();

  if (!trimmed) {
    return '';
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    return parsed.hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return trimmed
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
      .replace(/\/.*$/, '')
      .replace(/\/+$/, '')
      .toLowerCase();
  }
}

export function validateBusinessDomain(input: string): DomainValidationResult {
  const normalizedDomain = normalizeDomainInput(input);

  if (!normalizedDomain) {
    return {
      isValid: false,
      normalizedDomain: '',
      errorMessage: 'Ingresa una URL valida para continuar.',
    };
  }

  if (normalizedDomain === 'localhost' || normalizedDomain.endsWith('.local')) {
    return {
      isValid: false,
      normalizedDomain,
      errorMessage: 'Usa el dominio publico de tu sitio, no una direccion local.',
    };
  }

  if (!normalizedDomain.includes('.')) {
    return {
      isValid: false,
      normalizedDomain,
      errorMessage: 'La URL debe tener un dominio valido, por ejemplo tuempresa.com.',
    };
  }

  if (!/^[a-z0-9.-]+$/i.test(normalizedDomain) || normalizedDomain.startsWith('.') || normalizedDomain.endsWith('.')) {
    return {
      isValid: false,
      normalizedDomain,
      errorMessage: 'La URL tiene caracteres no validos.',
    };
  }

  return {
    isValid: true,
    normalizedDomain,
    errorMessage: null,
  };
}
