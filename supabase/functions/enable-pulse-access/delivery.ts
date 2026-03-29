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
  const zeptoMailToken = Deno.env.get('ZEPTOMAIL_SEND_MAIL_TOKEN');
  const zeptoMailApiUrl =
    Deno.env.get('ZEPTOMAIL_API_URL') || 'https://api.zeptomail.com/v1.1/email';
  const from = Deno.env.get('SMTP_FROM') || 'pulse@tuweb-ai.com';
  const replyTo = Deno.env.get('EMAIL_REPLY_TO') || 'hola@tuweb-ai.com';
  const fromName = Deno.env.get('EMAIL_FROM_NAME') || 'Pulse by TuWebAI';

  if (!zeptoMailToken) {
    throw new Error('PULSE_ACCESS_EMAIL_CONFIG_MISSING');
  }

  const response = await fetch(zeptoMailApiUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Zoho-enczapikey ${zeptoMailToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: {
        address: from,
        name: fromName,
      },
      to: [
        {
          email_address: {
            address: params.to,
            name: params.name,
          },
        },
      ],
      reply_to: [
        {
          address: replyTo,
          name: fromName,
        },
      ],
      subject: generatePulseAccessEmailSubject({
        to: params.to,
        name: params.name,
        accessUrl: params.accessUrl,
        mode: params.mode,
      }),
      htmlbody: generatePulseAccessEmailHtml({
        to: params.to,
        name: params.name,
        accessUrl: params.accessUrl,
        mode: params.mode,
      }),
      track_clicks: false,
      track_opens: false,
      client_reference: `pulse-access:${params.mode}:${params.to}`,
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
