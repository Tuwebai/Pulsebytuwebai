import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

export function registerPulseResources(server: McpServer) {
  server.registerResource(
    'pulse-business-language',
    'pulse://context/language',
    {
      title: 'Guia de lenguaje Pulse',
      description: 'Cómo explicar metricas de Pulse en lenguaje de negocio.',
      mimeType: 'text/plain',
    },
    async (uri) => ({
      contents: [{
        uri: uri.href,
        text: [
          'Pulse habla en lenguaje de negocio para usuarios no tecnicos.',
          'Evitar siglas crudas, lenguaje antifraude o copy interno.',
          'Traducir metricas a impacto: visitas, consultas, paginas con mejor rendimiento y variacion del periodo.',
          'Si no hay datos, explicarlo con claridad y proponer el siguiente paso operativo.',
        ].join('\n'),
      }],
    }),
  );
}
