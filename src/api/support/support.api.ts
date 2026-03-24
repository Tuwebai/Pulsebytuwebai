import { supabase } from '@/lib/supabase/supabase';

interface AccountDeletionTicketPayload {
  email: string;
  userId: string;
}

export async function createAccountDeletionTicket({
  email,
  userId
}: AccountDeletionTicketPayload): Promise<void> {
  const now = new Date().toISOString();
  const message = `El usuario solicitó la baja de su cuenta en Pulse.\n\nmetadata: ${JSON.stringify({
    user_id: userId,
    requested_at: now
  })}`;

  const { error } = await supabase.from('tickets').insert({
    asunto: 'Solicitud de baja de cuenta',
    mensaje: message,
    email,
    user_id: userId,
    prioridad: 'media',
    priority: 'medium',
    estado: 'abierto',
    status: 'open',
    fecha: now,
    created_at: now,
    updated_at: now
  });

  if (error) {
    throw error;
  }
}
