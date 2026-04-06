import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { registerClientActionTools } from './tools/action-client-tools.js';
import { registerNotificationEmailTools } from './tools/action-email-tools.js';
import { registerNotificationSendTools } from './tools/action-notification-send-tools.js';
import { registerNotificationStateTools } from './tools/action-notification-state-tools.js';
import { registerProjectActionTools } from './tools/action-project-tools.js';
import { registerTicketActionTools } from './tools/action-ticket-tools.js';
import { registerClientActivityTools } from './tools/client-activity-tools.js';
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
  registerClientActivityTools(server);
  registerClientActionTools(server);
  registerNotificationEmailTools(server);
  registerNotificationSendTools(server);
  registerNotificationStateTools(server);
  registerProjectActionTools(server);
  registerTicketActionTools(server);

  return server;
}
