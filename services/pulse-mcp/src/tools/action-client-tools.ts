import * as z from 'zod/v4';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { createClientAccount, enableClientAccess, updateClientProfile } from '../pulse-data.js';
import { asConfirmationResult, asToolError, asToolResult, assertMutationsEnabled, resolveUserFromInput } from './shared.js';

export function registerClientActionTools(server: McpServer) {
  server.registerTool('invite_client', {
    title: 'Crear cliente en Pulse',
    description: 'Crea un cliente nuevo en Pulse con acceso pendiente. Usalo antes de habilitar el acceso real.',
    inputSchema: {
      email: z.string().email(),
      fullName: z.string().min(2),
      role: z.enum(['user', 'admin']).default('user'),
      confirm: z.boolean().default(false),
    },
    outputSchema: z.object({
      executed: z.boolean(),
      requires_confirmation: z.boolean().optional(),
      message: z.string(),
      preview: z.unknown().optional(),
      client: z.unknown().optional(),
    }),
  }, async ({ email, fullName, role, confirm }) => {
    try {
      assertMutationsEnabled();

      if (!confirm) {
        return asConfirmationResult('Esta accion va a crear un cliente nuevo en Pulse en estado pendiente. Reintentá con confirm=true para ejecutarla.', {
          email,
          fullName,
          role,
        });
      }

      return asToolResult({
        executed: true,
        message: 'Cliente creado en Pulse.',
        client: await createClientAccount({ email, fullName, role }),
      });
    } catch (error) {
      return asToolError(error);
    }
  });

  server.registerTool('enable_client_access', {
    title: 'Habilitar acceso a Pulse',
    description: 'Habilita acceso operativo a Pulse para un cliente existente usando email, nombre, telefono o UUID.',
    inputSchema: {
      userIdentifier: z.string().min(1),
      operatorUserId: z.string().uuid().optional(),
      confirm: z.boolean().default(false),
    },
    outputSchema: z.object({
      executed: z.boolean(),
      requires_confirmation: z.boolean().optional(),
      message: z.string(),
      preview: z.unknown().optional(),
      result: z.unknown().optional(),
    }),
  }, async ({ userIdentifier, operatorUserId, confirm }) => {
    try {
      assertMutationsEnabled();
      const resolvedUser = await resolveUserFromInput(userIdentifier);

      if (!confirm) {
        return asConfirmationResult('Esta accion va a habilitar el acceso operativo del cliente en Pulse. Reintentá con confirm=true para ejecutarla.', {
          resolvedUser: {
            id: resolvedUser.id,
            email: resolvedUser.email,
            full_name: resolvedUser.full_name,
          },
          operatorUserId: operatorUserId ?? null,
        });
      }

      return asToolResult({
        executed: true,
        message: 'Acceso operativo actualizado en Pulse.',
        result: await enableClientAccess({ userIdentifier: resolvedUser.id, operatorUserId }),
      });
    } catch (error) {
      return asToolError(error);
    }
  });

  server.registerTool('update_client', {
    title: 'Actualizar cliente',
    description: 'Actualiza email, nombre o rol operativo de un cliente usando identificadores naturales.',
    inputSchema: {
      userIdentifier: z.string().min(1),
      email: z.string().email().optional(),
      fullName: z.string().min(2).optional(),
      role: z.enum(['user', 'admin']).optional(),
      confirm: z.boolean().default(false),
    },
    outputSchema: z.object({
      executed: z.boolean(),
      requires_confirmation: z.boolean().optional(),
      message: z.string(),
      preview: z.unknown().optional(),
      client: z.unknown().optional(),
    }),
  }, async ({ userIdentifier, email, fullName, role, confirm }) => {
    try {
      assertMutationsEnabled();
      const resolvedUser = await resolveUserFromInput(userIdentifier);

      if (!email && !fullName && !role) {
        throw new Error('Necesitamos al menos un cambio para actualizar el cliente.');
      }

      if (!confirm) {
        return asConfirmationResult('Esta accion va a actualizar el perfil operativo del cliente en Pulse. Reintentá con confirm=true para ejecutarla.', {
          resolvedUser: {
            id: resolvedUser.id,
            email: resolvedUser.email,
            full_name: resolvedUser.full_name,
          },
          changes: { email: email ?? null, fullName: fullName ?? null, role: role ?? null },
        });
      }

      return asToolResult({
        executed: true,
        message: 'Cliente actualizado en Pulse.',
        client: await updateClientProfile({ userIdentifier: resolvedUser.id, email, fullName, role }),
      });
    } catch (error) {
      return asToolError(error);
    }
  });
}
