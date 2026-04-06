import { randomUUID } from 'node:crypto';

import type { Request, Response } from 'express';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';

import { pulseMcpAuthMiddleware } from './auth.js';
import { pulseMcpConfig } from './env.js';
import { createPulseMcpServer } from './tools.js';

type SessionEntry = {
  server: ReturnType<typeof createPulseMcpServer>;
  transport: StreamableHTTPServerTransport;
  isClosing: boolean;
};

const app = createMcpExpressApp({
  host: pulseMcpConfig.host,
  allowedHosts: pulseMcpConfig.allowedHosts.length > 0 ? pulseMcpConfig.allowedHosts : undefined,
});

const sessionTransports = new Map<string, SessionEntry>();

function getSessionId(req: Request) {
  const headerValue = req.header('mcp-session-id');
  return headerValue?.trim() || null;
}

function getRequestLabel(req: Request) {
  const bodyMethod = typeof req.body?.method === 'string' ? req.body.method : null;
  return bodyMethod ? `${req.method} ${req.path} ${bodyMethod}` : `${req.method} ${req.path}`;
}

function logRequest(req: Request, extra?: Record<string, string | null>) {
  console.log('[pulse-mcp]', getRequestLabel(req), {
    sessionId: getSessionId(req),
    ...extra,
  });
}

async function closeSession(sessionId: string) {
  const session = sessionTransports.get(sessionId);
  if (!session) {
    return;
  }

  if (session.isClosing) {
    return;
  }

  session.isClosing = true;
  sessionTransports.delete(sessionId);
  await session.transport.close();
  await session.server.close();
}

function attachSessionLifecycle(session: SessionEntry) {
  session.transport.onclose = () => {
    const sessionId = session.transport.sessionId;
    if (!sessionId) {
      return;
    }

    if (session.isClosing) {
      sessionTransports.delete(sessionId);
      return;
    }

    session.isClosing = true;
    sessionTransports.delete(sessionId);
    void session.server.close();
  };
}

function attachStatelessCleanup(res: Response, session: SessionEntry) {
  res.on('close', () => {
    void session.transport.close();
    void session.server.close();
  });
}

app.get('/healthz', (_req, res) => {
  res.json({
    ok: true,
    service: 'pulse-mcp',
    authRequired: pulseMcpConfig.requireAuth,
  });
});

app.post('/mcp', pulseMcpAuthMiddleware, async (req, res) => {
  try {
    const sessionId = getSessionId(req);
    const existingSession = sessionId ? sessionTransports.get(sessionId) : null;

    logRequest(req, {
      transportMode: existingSession ? 'session-reuse' : isInitializeRequest(req.body) ? 'session-init' : 'stateless',
    });

    if (existingSession) {
      await existingSession.transport.handleRequest(req, res, req.body);
      return;
    }

    if (!sessionId && isInitializeRequest(req.body)) {
      const server = createPulseMcpServer();
      let session: SessionEntry;
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (createdSessionId) => {
          sessionTransports.set(createdSessionId, session);
          console.log('[pulse-mcp] sesion MCP inicializada', { sessionId: createdSessionId });
        },
      });

      session.server = server;
      session.transport = transport;
      session.isClosing = false;
      attachSessionLifecycle(session);

      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      return;
    }

    const server = createPulseMcpServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    const session = { server, transport, isClosing: false };

    attachStatelessCleanup(res, session);

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Pulse MCP fallo al procesar la solicitud.';
    console.error('[pulse-mcp] error procesando POST /mcp', {
      sessionId: getSessionId(req),
      message,
    });

    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message },
        id: null,
      });
    }
  }
});

app.get('/mcp', pulseMcpAuthMiddleware, async (req, res) => {
  const sessionId = getSessionId(req);
  const session = sessionId ? sessionTransports.get(sessionId) : null;

  logRequest(req, { transportMode: 'sse-get' });

  if (!sessionId || !session) {
    res.status(400).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Sesion MCP invalida o ausente.' },
      id: null,
    });
    return;
  }

  try {
    await session.transport.handleRequest(req, res);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Pulse MCP fallo al abrir el stream.';
    console.error('[pulse-mcp] error procesando GET /mcp', { sessionId, message });

    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message },
        id: null,
      });
    }
  }
});

app.delete('/mcp', pulseMcpAuthMiddleware, async (req, res) => {
  const sessionId = getSessionId(req);
  const session = sessionId ? sessionTransports.get(sessionId) : null;

  logRequest(req, { transportMode: 'session-delete' });

  if (!sessionId || !session) {
    res.status(400).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Sesion MCP invalida o ausente.' },
      id: null,
    });
    return;
  }

  try {
    await session.transport.handleRequest(req, res);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Pulse MCP fallo al cerrar la sesion.';
    console.error('[pulse-mcp] error procesando DELETE /mcp', { sessionId, message });

    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message },
        id: null,
      });
    }
  } finally {
    await closeSession(sessionId);
  }
});

app.listen(pulseMcpConfig.port, pulseMcpConfig.host, () => {
  console.log(`Pulse MCP escuchando en ${pulseMcpConfig.publicUrl}`);
});
