import type { BusinessIndustry, ProfileRow, ProfileUpdatePayload } from '@/data/types/profile';
import { fetchProfile, signOutAllDevices, updatePassword, updateProfile, uploadAvatar } from '@/api/profile/profile.api';
import { submitAccountDeletionRequest } from '@/features/profile/services/accountDeletion.service';

const VALID_INDUSTRIES = new Set<BusinessIndustry>([
  'gastronomia',
  'salud',
  'legal',
  'estetica',
  'fitness',
  'educacion',
  'inmobiliaria',
  'tecnologia',
  'comercio',
  'otro',
]);

function validateProfilePayload(data: ProfileUpdatePayload) {
  if (data.full_name !== undefined && data.full_name.trim().length < 2) {
    throw new Error('El nombre completo debe tener al menos 2 caracteres.');
  }

  if (data.phone !== undefined && data.phone.trim().length > 0 && !/^[+\d\s-]+$/.test(data.phone.trim())) {
    throw new Error('El teléfono solo puede incluir números, espacios, + y guiones.');
  }

  if (data.business_name !== undefined && data.business_name.trim().length < 2) {
    throw new Error('El nombre del negocio debe tener al menos 2 caracteres.');
  }

  if (data.business_industry !== undefined && !VALID_INDUSTRIES.has(data.business_industry)) {
    throw new Error('Seleccioná un rubro válido para tu negocio.');
  }
}

export async function getProfile(userId: string): Promise<ProfileRow> {
  const profile = await fetchProfile(userId);

  if (!profile) {
    throw new Error('PROFILE_NOT_FOUND');
  }

  return profile;
}

export async function saveProfile(userId: string, data: ProfileUpdatePayload): Promise<void> {
  validateProfilePayload(data);
  await updateProfile(userId, data);
}

export async function changeAvatar(userId: string, file: File): Promise<string> {
  const avatarUrl = await uploadAvatar(userId, file);
  await updateProfile(userId, { avatar_url: avatarUrl });
  return avatarUrl;
}

export async function changePassword(current: string, newPassword: string): Promise<void> {
  if (newPassword.trim().length < 8) {
    throw new Error('La nueva contraseña debe tener al menos 8 caracteres.');
  }

  if (current.trim() === newPassword.trim()) {
    throw new Error('La nueva contraseña no puede ser igual a la actual.');
  }

  await updatePassword(newPassword);
}

export async function closeAllSessions(): Promise<void> {
  await signOutAllDevices();
}

export async function requestAccountDeletion(reason: string): Promise<void> {
  await submitAccountDeletionRequest(reason);
}
