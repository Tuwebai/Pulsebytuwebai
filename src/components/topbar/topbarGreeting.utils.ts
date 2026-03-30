interface PulseGreetingParams {
  isAdminPage: boolean;
  isClientPulseRoute: boolean;
  projectCount: number;
  userName: string | null;
}

function getTimeGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Buenos días';
  }

  if (hour < 20) {
    return 'Buenas tardes';
  }

  return 'Buenas noches';
}

export function getPulseGreeting({
  isAdminPage,
  isClientPulseRoute,
  projectCount,
  userName,
}: PulseGreetingParams) {
  const baseGreeting = getTimeGreeting();
  const resolvedName = userName ?? (isAdminPage ? 'equipo' : 'tu equipo');

  if (isAdminPage) {
    return `${baseGreeting}, ${resolvedName}`;
  }

  if (isClientPulseRoute) {
    if (projectCount > 1) {
      return `${baseGreeting}, ${resolvedName}. Hoy Pulse sigue ${projectCount} proyectos`;
    }

    if (projectCount === 1) {
      return `${baseGreeting}, ${resolvedName}. Hoy Pulse sigue tu proyecto activo`;
    }

    return `${baseGreeting}, ${resolvedName}. Pulse ya está listo para tu web`;
  }

  return `${baseGreeting}, ${resolvedName}`;
}
