import { createSupabaseAdminClient } from './request.ts';
import { sendConsultationAlertEmail } from './delivery.ts';
import { type ConsultationAlertRecipient, type ProjectRow, type UserPreferenceRow } from './types.ts';

export async function insertConsultationNotification(params: {
  supabase: ReturnType<typeof createSupabaseAdminClient>;
  project: ProjectRow;
  date: string;
  conversions: number;
}) {
  if (params.conversions <= 0 || !params.project.created_by) {
    return;
  }

  const { data: userPrefs, error: userPrefsError } = await params.supabase
    .from('users')
    .select('notif_new_consultation, full_name')
    .eq('id', params.project.created_by)
    .maybeSingle();

  if (userPrefsError) {
    throw userPrefsError;
  }

  if ((userPrefs as UserPreferenceRow | null)?.notif_new_consultation === false) {
    return;
  }

  const { data: authUser, error: authUserError } = await params.supabase.auth.admin.getUserById(params.project.created_by);

  if (authUserError) {
    throw authUserError;
  }

  const recipient: ConsultationAlertRecipient = {
    id: params.project.created_by,
    email: authUser.user?.email ?? null,
    full_name:
      (userPrefs as (UserPreferenceRow & { full_name?: string | null }) | null)?.full_name ??
      authUser.user?.user_metadata?.full_name ??
      authUser.user?.user_metadata?.name ??
      null,
    notif_new_consultation: (userPrefs as UserPreferenceRow | null)?.notif_new_consultation ?? null,
  };

  const { data: existingNotification, error: existingNotificationError } = await params.supabase
    .from('notifications')
    .select('id')
    .eq('user_id', params.project.created_by)
    .eq('type', 'warning')
    .eq('category', 'system')
    .contains('metadata', { project_id: params.project.id, date: params.date })
    .limit(1)
    .maybeSingle();

  if (existingNotificationError) {
    throw existingNotificationError;
  }

  if (existingNotification?.id) {
    return;
  }

  const conversionLabel = `${params.conversions} consulta${params.conversions > 1 ? 's' : ''} nueva${params.conversions > 1 ? 's' : ''}`;
  const { error: notificationError } = await params.supabase.from('notifications').insert({
    user_id: params.project.created_by,
    type: 'warning',
    category: 'system',
    title: conversionLabel,
    message: 'Alguien se contacto a traves de tu web.',
    is_read: false,
    action_url: '/dashboard/pulse',
    metadata: {
      project_id: params.project.id,
      date: params.date,
      count: params.conversions,
    },
  });

  if (notificationError) {
    throw notificationError;
  }

  await sendConsultationAlertEmail({
    recipient,
    domain: params.project.domain,
    consultations: params.conversions,
    date: params.date,
  });
}
