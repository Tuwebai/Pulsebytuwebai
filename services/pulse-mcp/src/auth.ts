import type { NextFunction, Request, Response } from 'express';

import { pulseMcpConfig } from './env.js';

function getBearerToken(headerValue: string | undefined): string | null {
  if (!headerValue) {
    return null;
  }

  const [scheme, token] = headerValue.trim().split(/\s+/, 2);

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
}

export function pulseMcpAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!pulseMcpConfig.requireAuth) {
    next();
    return;
  }

  const token = getBearerToken(req.header('authorization'));

  if (!token || token !== pulseMcpConfig.authToken) {
    res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Pulse MCP requiere un bearer token valido.',
    });
    return;
  }

  next();
}

export function assertProjectAllowed(projectId: string) {
  const { allowedProjectIds } = pulseMcpConfig;

  if (allowedProjectIds.length > 0 && !allowedProjectIds.includes(projectId)) {
    throw new Error(`El proyecto ${projectId} no esta habilitado para este servidor MCP.`);
  }
}

export function assertUserAllowed(userId: string) {
  const { allowedUserIds } = pulseMcpConfig;

  if (allowedUserIds.length > 0 && !allowedUserIds.includes(userId)) {
    throw new Error(`El usuario ${userId} no esta habilitado para este servidor MCP.`);
  }
}
