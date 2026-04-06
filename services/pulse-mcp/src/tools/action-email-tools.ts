import * as z from 'zod/v4';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { sendBillingEmail, sendBrandedEmail, sendOnboardingEmail } from '../pulse-data.js';
import { asConfirmationResult, asToolError, asToolResult, assertMutationsEnabled, resolveUserFromInput, runIdempotentMutation } from './shared.js';

export function registerNotificationEmailTools(server: McpServer) {
  server.registerTool('send_onboarding_email', {
    title: 'Enviar email de onboarding Pulse',
    description: 'Envía un email de onboarding con copy cerrado y branding Pulse a un cliente existente.',
    inputSchema: {
      recipientIdentifier: z.string().min(1),
      nextStep: z.string().min(1).optional(),
      ctaUrl: z.string().url().optional(),
      confirm: z.boolean().default(false),
    },
    outputSchema: z.object({
      executed: z.boolean(),
      requires_confirmation: z.boolean().optional(),
      message: z.string(),
      preview: z.unknown().optional(),
      result: z.unknown().optional(),
    }),
  }, async ({ recipientIdentifier, nextStep, ctaUrl, confirm }) => {
    try {
      assertMutationsEnabled();
      const resolvedUser = await resolveUserFromInput(recipientIdentifier);

      if (!confirm) {
        return asConfirmationResult('Esta accion va a enviar un email de onboarding con branding Pulse. Reintentá con confirm=true para ejecutarla.', {
          resolvedRecipient: {
            id: resolvedUser.id,
            email: resolvedUser.email,
            full_name: resolvedUser.full_name,
          },
          email: {
            variant: 'onboarding',
            nextStep: nextStep ?? null,
            ctaUrl: ctaUrl ?? 'https://pulse.tuweb-ai.com/dashboard',
          },
        });
      }

      const result = await runIdempotentMutation('send_onboarding_email', {
        recipientId: resolvedUser.id,
        nextStep: nextStep ?? null,
        ctaUrl: ctaUrl ?? null,
      }, () => sendOnboardingEmail({
        recipientIdentifier: resolvedUser.id,
        nextStep,
        ctaUrl,
      }));

      return asToolResult({
        executed: true,
        message: 'Email de onboarding enviado con branding Pulse.',
        result,
      });
    } catch (error) {
      return asToolError(error);
    }
  });

  server.registerTool('send_billing_email', {
    title: 'Enviar email de facturacion Pulse',
    description: 'Envía un email de facturación con branding Pulse a un cliente existente.',
    inputSchema: {
      recipientIdentifier: z.string().min(1),
      summary: z.string().min(1),
      dueDate: z.string().min(1).optional(),
      ctaLabel: z.string().min(1).optional(),
      ctaUrl: z.string().url().optional(),
      confirm: z.boolean().default(false),
    },
    outputSchema: z.object({
      executed: z.boolean(),
      requires_confirmation: z.boolean().optional(),
      message: z.string(),
      preview: z.unknown().optional(),
      result: z.unknown().optional(),
    }),
  }, async ({ recipientIdentifier, summary, dueDate, ctaLabel, ctaUrl, confirm }) => {
    try {
      assertMutationsEnabled();
      const resolvedUser = await resolveUserFromInput(recipientIdentifier);

      if (!confirm) {
        return asConfirmationResult('Esta accion va a enviar un email de facturación con branding Pulse. Reintentá con confirm=true para ejecutarla.', {
          resolvedRecipient: {
            id: resolvedUser.id,
            email: resolvedUser.email,
            full_name: resolvedUser.full_name,
          },
          email: {
            variant: 'billing',
            summary,
            dueDate: dueDate ?? null,
            ctaLabel: ctaLabel ?? null,
            ctaUrl: ctaUrl ?? null,
          },
        });
      }

      const result = await runIdempotentMutation('send_billing_email', {
        recipientId: resolvedUser.id,
        summary,
        dueDate: dueDate ?? null,
        ctaLabel: ctaLabel ?? null,
        ctaUrl: ctaUrl ?? null,
      }, () => sendBillingEmail({
        recipientIdentifier: resolvedUser.id,
        summary,
        dueDate,
        ctaLabel,
        ctaUrl,
      }));

      return asToolResult({
        executed: true,
        message: 'Email de facturación enviado con branding Pulse.',
        result,
      });
    } catch (error) {
      return asToolError(error);
    }
  });

  server.registerTool('send_branded_email', {
    title: 'Enviar email con branding Pulse',
    description: 'Envia un email a un cliente existente usando email, nombre, telefono o UUID, con plantilla visual de Pulse by TuWebAI.',
    inputSchema: {
      recipientIdentifier: z.string().min(1),
      subject: z.string().min(1),
      message: z.string().min(1),
      heading: z.string().min(1).optional(),
      preheader: z.string().min(1).optional(),
      ctaLabel: z.string().min(1).optional(),
      ctaUrl: z.string().url().optional(),
      footerNote: z.string().min(1).optional(),
      confirm: z.boolean().default(false),
    },
    outputSchema: z.object({
      executed: z.boolean(),
      requires_confirmation: z.boolean().optional(),
      message: z.string(),
      preview: z.unknown().optional(),
      result: z.unknown().optional(),
    }),
  }, async ({ recipientIdentifier, subject, message, heading, preheader, ctaLabel, ctaUrl, footerNote, confirm }) => {
    try {
      assertMutationsEnabled();
      const resolvedUser = await resolveUserFromInput(recipientIdentifier);

      if (!confirm) {
        return asConfirmationResult('Esta accion va a enviar un email real con branding Pulse al cliente. Reintentá con confirm=true para ejecutarla.', {
          resolvedRecipient: {
            id: resolvedUser.id,
            email: resolvedUser.email,
            full_name: resolvedUser.full_name,
          },
          email: {
            subject,
            heading: heading ?? subject,
            preheader: preheader ?? null,
            message,
            ctaLabel: ctaLabel ?? null,
            ctaUrl: ctaUrl ?? null,
            footerNote: footerNote ?? null,
          },
        });
      }

      const result = await runIdempotentMutation('send_branded_email', {
        recipientId: resolvedUser.id,
        subject,
        message,
        heading: heading ?? null,
        preheader: preheader ?? null,
        ctaLabel: ctaLabel ?? null,
        ctaUrl: ctaUrl ?? null,
        footerNote: footerNote ?? null,
      }, () => sendBrandedEmail({
        recipientIdentifier: resolvedUser.id,
        subject,
        message,
        heading,
        preheader,
        ctaLabel,
        ctaUrl,
        footerNote,
      }));

      return asToolResult({
        executed: true,
        message: 'Email enviado con branding Pulse.',
        result,
      });
    } catch (error) {
      return asToolError(error);
    }
  });
}
