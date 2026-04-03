import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

import { pulseMcpAuthMiddleware } from './auth.js';
import { pulseMcpConfig } from './env.js';
import { createPulseMcpServer } from './tools.js';

const app = createMcpExpressApp({
  host: pulseMcpConfig.host,
  allowedHosts: pulseMcpConfig.allowedHosts.length > 0 ? pulseMcpConfig.allowedHosts : undefined,
});

app.get('/healthz', (_req, res) => {
  res.json({
    ok: true,
    service: 'pulse-mcp',
    authRequired: pulseMcpConfig.requireAuth,
  });
});

app.post('/mcp', pulseMcpAuthMiddleware, async (req, res) => {
  const server = createPulseMcpServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Pulse MCP fallo al procesar la solicitud.';

    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message },
        id: null,
      });
    }
  } finally {
    await transport.close();
    await server.close();
  }
});

app.get('/mcp', pulseMcpAuthMiddleware, (_req, res) => {
  res.status(405).json({
    jsonrpc: '2.0',
    error: { code: -32000, message: 'Method not allowed.' },
    id: null,
  });
});

app.delete('/mcp', pulseMcpAuthMiddleware, (_req, res) => {
  res.status(405).json({
    jsonrpc: '2.0',
    error: { code: -32000, message: 'Method not allowed.' },
    id: null,
  });
});

app.listen(pulseMcpConfig.port, pulseMcpConfig.host, () => {
  console.log(`Pulse MCP escuchando en ${pulseMcpConfig.publicUrl}`);
});
