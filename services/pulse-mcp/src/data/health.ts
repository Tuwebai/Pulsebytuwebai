import { pulseMcpConfig } from '../env.js';
import { supabase } from './client.js';

export async function fetchHealthCheck() {
  const [dbProbe, userProbe] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }).limit(1),
    supabase.from('users').select('id').limit(1),
  ]);

  const database = {
    ok: !dbProbe.error && !userProbe.error,
    error: dbProbe.error?.message || userProbe.error?.message || null,
  };

  return {
    service: {
      name: 'pulse-mcp',
      ok: database.ok,
      public_url: pulseMcpConfig.publicUrl,
    },
    auth: {
      required: pulseMcpConfig.requireAuth,
      token_configured: Boolean(pulseMcpConfig.authToken),
    },
    mutations: {
      enabled: pulseMcpConfig.mutationsEnabled,
      operator_user_configured: Boolean(pulseMcpConfig.operatorUserId),
    },
    email: {
      configured: Boolean(process.env.ZEPTOMAIL_SEND_MAIL_TOKEN && process.env.SMTP_FROM),
      from: process.env.SMTP_FROM || null,
      reply_to: process.env.EMAIL_REPLY_TO || null,
    },
    push: {
      configured: Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.PUSH_DISPATCH_SECRET),
    },
    allowlists: {
      projects: pulseMcpConfig.allowedProjectIds.length,
      users: pulseMcpConfig.allowedUserIds.length,
    },
    database,
    checked_at: new Date().toISOString(),
  };
}
