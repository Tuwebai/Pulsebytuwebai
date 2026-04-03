import { supabase } from './client.js';

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function normalizeUserRole(role?: string): 'admin' | 'user' {
  return role === 'admin' ? 'admin' : 'user';
}

export async function findAuthUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  let page = 1;

  while (page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 200,
    });

    if (error) {
      throw error;
    }

    const authUser = data.users.find((user) => normalizeEmail(user.email ?? '') === normalizedEmail);

    if (authUser) {
      return authUser;
    }

    if (data.users.length < 200) {
      break;
    }

    page += 1;
  }

  return null;
}

export async function waitForProfileRow(userId: string) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data?.id) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  throw new Error('PROFILE_ROW_NOT_READY');
}
