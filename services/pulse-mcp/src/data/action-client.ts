import { pulseMcpConfig } from '../env.js';
import { supabase } from './client.js';
import { findAuthUserByEmail, isValidEmail, normalizeEmail, normalizeUserRole, waitForProfileRow } from './admin.js';
import { deliverPulseAccessEmail } from './pulse-access-delivery.js';
import { fetchUserById, resolveUserIdentifier } from './users.js';

function requireOperatorUserId(operatorUserId?: string) {
  const resolvedOperatorUserId = operatorUserId?.trim() || pulseMcpConfig.operatorUserId;

  if (!resolvedOperatorUserId) {
    throw new Error('Falta operatorUserId para auditar esta accion en Pulse.');
  }

  return resolvedOperatorUserId;
}

export async function createClientAccount(input: {
  email: string;
  fullName: string;
  role?: string;
}) {
  const email = normalizeEmail(input.email);
  const fullName = input.fullName.trim();
  const role = normalizeUserRole(input.role);

  if (!isValidEmail(email)) {
    throw new Error('Necesitamos un email valido para crear el cliente.');
  }

  if (fullName.length < 2) {
    throw new Error('Necesitamos el nombre completo del cliente para crearlo.');
  }

  const { data: existingProfile, error: existingProfileError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existingProfileError) throw existingProfileError;
  if (existingProfile?.id) throw new Error('Ya existe un cliente de Pulse con ese email.');

  const existingAuthUser = await findAuthUserByEmail(email);
  if (existingAuthUser?.id) {
    throw new Error('Ese email ya existe en Auth y necesita revision operativa antes de reutilizarlo.');
  }

  const { data: createdAuth, error: authCreateError } = await supabase.auth.admin.createUser({
    email,
    email_confirm: false,
    user_metadata: { full_name: fullName },
  });

  if (authCreateError || !createdAuth.user?.id) {
    throw authCreateError ?? new Error('AUTH_CREATE_FAILED');
  }

  await waitForProfileRow(createdAuth.user.id);
  const timestamp = new Date().toISOString();

  const { data: updatedProfile, error: profileUpdateError } = await supabase
    .from('users')
    .update({
      email,
      full_name: fullName,
      role,
      pulse_access_status: 'pending',
      pulse_access_granted_at: null,
      pulse_access_granted_by: null,
      pulse_access_disabled_at: null,
      updated_at: timestamp,
    })
    .eq('id', createdAuth.user.id)
    .select('id, email, full_name, role, pulse_access_status, updated_at')
    .single();

  if (profileUpdateError) throw profileUpdateError;

  return updatedProfile;
}

export async function enableClientAccess(input: {
  userIdentifier: string;
  operatorUserId?: string;
}) {
  const user = await resolveUserIdentifier(input.userIdentifier);
  const operatorUserId = requireOperatorUserId(input.operatorUserId);
  const currentUser = await fetchUserById(user.id);

  if (currentUser.pulse_access_status === 'disabled') {
    throw new Error('El cliente tiene el acceso a Pulse revocado. Reactivarlo requiere una decision operativa separada.');
  }

  const timestamp = new Date().toISOString();
  const nextStatus = currentUser.pulse_access_status === 'active' ? 'active' : 'invited';
  const authUser = currentUser.email ? await findAuthUserByEmail(currentUser.email) : null;
  const { data: updatedUser, error } = await supabase
    .from('users')
    .update({
      pulse_access_status: nextStatus,
      pulse_access_granted_at: currentUser.pulse_access_granted_at ?? timestamp,
      pulse_access_granted_by: operatorUserId,
      pulse_access_disabled_at: null,
      updated_at: timestamp,
    })
    .eq('id', user.id)
    .select('id, email, full_name, pulse_access_status, pulse_access_granted_at, pulse_access_granted_by')
    .single();

  if (error) throw error;

  const delivery = currentUser.email
    ? await deliverPulseAccessEmail({
        email: normalizeEmail(currentUser.email),
        fullName: currentUser.full_name ?? null,
        invited: !authUser?.email,
      })
    : {
        email_sent: false,
        delivery_type: 'none' as const,
        email_mode: 'none' as const,
      };

  return {
    user: updatedUser,
    delivery,
  };
}

export async function updateClientProfile(input: {
  userIdentifier: string;
  email?: string;
  fullName?: string;
  role?: string;
}) {
  const user = await resolveUserIdentifier(input.userIdentifier);
  const currentUser = await fetchUserById(user.id);
  const nextEmail = input.email ? normalizeEmail(input.email) : normalizeEmail(currentUser.email ?? '');
  const nextFullName = input.fullName?.trim() || currentUser.full_name || null;
  const nextRole = normalizeUserRole(input.role ?? currentUser.role ?? 'user');

  if (!nextEmail || !isValidEmail(nextEmail)) {
    throw new Error('Necesitamos un email valido para actualizar el cliente.');
  }

  if (!nextFullName || nextFullName.length < 2) {
    throw new Error('Necesitamos un nombre valido para actualizar el cliente.');
  }

  const { data: duplicatedUser, error: duplicatedUserError } = await supabase
    .from('users')
    .select('id')
    .eq('email', nextEmail)
    .neq('id', user.id)
    .maybeSingle();

  if (duplicatedUserError) throw duplicatedUserError;
  if (duplicatedUser?.id) throw new Error('Ese email ya esta siendo usado por otro usuario de Pulse.');

  const timestamp = new Date().toISOString();
  const { data: updatedUser, error } = await supabase
    .from('users')
    .update({
      email: nextEmail,
      full_name: nextFullName,
      role: nextRole,
      updated_at: timestamp,
    })
    .eq('id', user.id)
    .select('id, email, full_name, role, pulse_access_status, updated_at')
    .single();

  if (error) throw error;

  const authUpdate = await supabase.auth.admin.updateUserById(user.id, {
    email: nextEmail,
    user_metadata: { full_name: nextFullName },
  });

  if (authUpdate.error) {
    throw authUpdate.error;
  }

  return updatedUser;
}
