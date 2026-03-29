// @ts-expect-error - Deno runtime
/// <reference lib="deno.window" />
import { generatePulseAccessEmailHtml, generatePulseAccessEmailSubject } from './template.ts';

export type PulseAccessEmailMode = 'welcome' | 'reentry';

interface GeneratePulseAccessLinkParams {
  adminClient: {
    auth: {
      admin: {
        generateLink: (params: {
          type: 'invite' | 'magiclink';
          email: string;
          options: { redirectTo: string };
        }) => Promise<{
          data: {
            properties?: {
              action_link?: string;
            };
          } | null;
          error: Error | null;
        }>;
      };
    };
  };
  email: string;
  redirectTo: string;
  invited: boolean;
}

interface DeliverPulseAccessParams {
  adminClient: GeneratePulseAccessLinkParams['adminClient'];
  email: string;
  fullName: string | null;
  invited: boolean;
  redirectTo: string;
  mode: PulseAccessEmailMode;
}

export async function generatePulseAccessLink({
  adminClient,
  email,
  redirectTo,
  invited,
}: GeneratePulseAccessLinkParams) {
  const linkResult = await adminClient.auth.admin.generateLink({
    type: invited ? 'invite' : 'magiclink',
    email,
    options: { redirectTo },
  });

  if (linkResult.error) {
    throw linkResult.error;
  }

  const actionLink = linkResult.data?.properties?.action_link;

  if (!actionLink) {
    throw new Error('PULSE_ACCESS_LINK_MISSING');
  }

  return {
    accessUrl: actionLink,
    deliveryType: invited ? 'invite' as const : 'magiclink' as const,
  };
}

export async function sendPulseAccessEmail(params: {
  to: string;
  name: string;
  accessUrl: string;
  mode: PulseAccessEmailMode;
}) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  const from = Deno.env.get('SMTP_FROM') || 'pulse@tuweb-ai.com';
  const replyTo = Deno.env.get('EMAIL_REPLY_TO') || 'hola@tuweb-ai.com';

  if (!resendApiKey) {
    throw new Error('PULSE_ACCESS_EMAIL_CONFIG_MISSING');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: params.to,
      reply_to: replyTo,
      subject: generatePulseAccessEmailSubject({
        to: params.to,
        name: params.name,
        accessUrl: params.accessUrl,
        mode: params.mode,
      }),
      html: generatePulseAccessEmailHtml({
        to: params.to,
        name: params.name,
        accessUrl: params.accessUrl,
        mode: params.mode,
      }),
    }),
  });

  if (!response.ok) {
    throw new Error(`PULSE_ACCESS_EMAIL_FAILED:${response.status}:${await response.text()}`);
  }
}

export async function deliverPulseAccess({
  adminClient,
  email,
  fullName,
  invited,
  redirectTo,
  mode,
}: DeliverPulseAccessParams) {
  const link = await generatePulseAccessLink({
    adminClient,
    email,
    redirectTo,
    invited,
  });

  await sendPulseAccessEmail({
    to: email,
    name: fullName || 'cliente',
    accessUrl: link.accessUrl,
    mode,
  });

  return {
    invited,
    email_sent: true,
    delivery_type: link.deliveryType,
    email_mode: mode,
  };
}
