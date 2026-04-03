import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { registerClientTools } from './tools/client-tools.js';
import { registerPulseTools } from './tools/pulse-tools.js';
import { registerPulseResources } from './tools/resources.js';

export function createPulseMcpServer() {
  const server = new McpServer(
    { name: 'pulse-mcp', version: '0.1.0' },
    { capabilities: { logging: {} } },
  );

  registerPulseResources(server);
  registerPulseTools(server);
  registerClientTools(server);

  return server;
}
