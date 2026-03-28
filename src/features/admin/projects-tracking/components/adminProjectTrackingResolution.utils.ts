function normalizeText(value?: string): string {
  return value?.trim().toLowerCase() ?? '';
}

export function isAdminProjectTrackingDoneStatus(status?: string): boolean {
  const normalized = normalizeText(status);
  return ['done', 'completed', 'terminada', 'terminado', 'finalizada', 'finalizado'].some((token) =>
    normalized.includes(token),
  );
}

export function isAdminProjectTrackingOverdue(dateValue?: string): boolean {
  if (!dateValue) {
    return false;
  }

  const dueDate = new Date(dateValue);
  if (Number.isNaN(dueDate.getTime())) {
    return false;
  }

  dueDate.setHours(23, 59, 59, 999);
  return dueDate.getTime() < Date.now();
}
