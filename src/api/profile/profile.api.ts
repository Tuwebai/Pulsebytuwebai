import { supabase } from '@/data/supabase/client';
import type { ProfileRow, ProfileUpdatePayload } from '@/data/types/profile';

const PROFILE_SELECT =
  'id, email, full_name, phone, avatar_url, business_name, business_industry, profile_completed, updated_at';

const ACCEPTED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

export class AvatarUploadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AvatarUploadValidationError';
  }
}

function getAvatarExtension(file: File): string {
  switch (file.type) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    default:
      throw new AvatarUploadValidationError('El archivo debe ser JPG, PNG o WebP.');
  }
}

function normalizeProfile(row: Partial<ProfileRow> & Pick<ProfileRow, 'id' | 'email'>): ProfileRow {
  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name ?? null,
    phone: row.phone ?? null,
    avatar_url: row.avatar_url ?? null,
    business_name: row.business_name ?? null,
    business_industry: row.business_industry ?? null,
    profile_completed: row.profile_completed ?? false,
    updated_at: row.updated_at ?? new Date().toISOString()
  };
}

export async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase.from('users').select(PROFILE_SELECT).eq('id', userId).maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return normalizeProfile(data as ProfileRow);
}

export async function updateProfile(userId: string, data: ProfileUpdatePayload): Promise<void> {
  const updates: Record<string, string | boolean | null> = {
    profile_completed: true,
    updated_at: new Date().toISOString()
  };

  if (data.full_name !== undefined) {
    updates.full_name = data.full_name;
  }

  if (data.phone !== undefined) {
    updates.phone = data.phone || null;
  }

  if (data.avatar_url !== undefined) {
    updates.avatar_url = data.avatar_url || null;
  }

  if (data.business_name !== undefined) {
    updates.business_name = data.business_name || null;
  }

  if (data.business_industry !== undefined) {
    updates.business_industry = data.business_industry || null;
  }

  const { error } = await supabase.from('users').update(updates).eq('id', userId);

  if (error) {
    throw error;
  }
}

export async function uploadAvatar(userId: string, file: File): Promise<string> {
  if (!ACCEPTED_AVATAR_TYPES.includes(file.type as (typeof ACCEPTED_AVATAR_TYPES)[number])) {
    throw new AvatarUploadValidationError('El archivo debe ser JPG, PNG o WebP.');
  }

  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    throw new AvatarUploadValidationError('La imagen debe pesar 5MB o menos.');
  }

  const extension = getAvatarExtension(file);
  const path = `${userId}/avatar.${extension}`;

  const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    throw error;
  }
}

export async function signOutAllDevices(): Promise<void> {
  const { error } = await supabase.auth.signOut({ scope: 'global' });

  if (error) {
    throw error;
  }
}
