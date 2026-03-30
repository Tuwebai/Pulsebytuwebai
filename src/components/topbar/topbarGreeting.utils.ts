const GREETING_KEY = 'websy_ai_greeting';
const GREETING_TIME_KEY = 'websy_ai_greeting_time';
const TEN_HOURS_IN_MS = 10 * 60 * 60 * 1000;

export function isStoredGreetingValid() {
  const storedGreeting = localStorage.getItem(GREETING_KEY);
  const storedTime = localStorage.getItem(GREETING_TIME_KEY);

  if (!storedGreeting || !storedTime) {
    return false;
  }

  const greetingTime = new Date(storedTime).getTime();
  const currentTime = new Date().getTime();
  return currentTime - greetingTime < TEN_HOURS_IN_MS;
}

export function loadStoredGreeting() {
  if (!isStoredGreetingValid()) {
    return null;
  }

  return localStorage.getItem(GREETING_KEY);
}

export function saveGreeting(greeting: string) {
  localStorage.setItem(GREETING_KEY, greeting);
  localStorage.setItem(GREETING_TIME_KEY, new Date().toISOString());
}

function getSpanishDayName(dayOfWeek: number) {
  switch (dayOfWeek) {
    case 0:
      return 'Domingo';
    case 1:
      return 'Lunes';
    case 2:
      return 'Martes';
    case 3:
      return 'Miércoles';
    case 4:
      return 'Jueves';
    case 5:
      return 'Viernes';
    default:
      return 'Sábado';
  }
}

export function buildAdminGreetingPrompt(userName: string, hour: number, dayOfWeek: number) {
  return `Genera un saludo corto y motivacional para el administrador ${userName}.

Contexto:
- Hora: ${hour}:00
- Día: ${getSpanishDayName(dayOfWeek)}
- Eres Websy AI

Instrucciones:
- Saludo corto (máximo 8 palabras)
- Incluye el nombre ${userName}
- Usa 1 emoji simple
- Tono motivacional
- Varía cada vez

Responde SOLO con el saludo, sin explicaciones.`;
}

export function buildClientGreetingPrompt(userName: string, hour: number, dayOfWeek: number, projectCount: number) {
  return `Genera un saludo corto y motivacional para el cliente ${userName}.

Contexto:
- Nombre: ${userName}
- Hora: ${hour}:00
- Día: ${getSpanishDayName(dayOfWeek)}
- Proyectos: ${projectCount}
- Eres Websy AI

Instrucciones:
- Saludo corto (máximo 8 palabras)
- Incluye el nombre ${userName}
- Usa 1 emoji simple
- Tono motivacional
- Menciona brevemente sus proyectos
- Varía cada vez

Responde SOLO con el saludo, sin explicaciones.`;
}

export function getFallbackGreeting() {
  return '¡Hola! Websy AI aquí';
}
