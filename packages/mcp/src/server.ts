import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerTools } from "./tools/index.js";
import { registerResources } from "./resources/index.js";
import { registerPrompts } from "./prompts/index.js";

export interface McpServerConfig {
  specs?: string;
  tokens?: string;
  components?: string;
  validation?: {
    level?: "basic" | "standard" | "strict";
  };
}

export function createMcpServer(config: McpServerConfig = {}): McpServer {
  const server = new McpServer({
    name: "grimorio",
    version: "0.1.0",
  });

  registerTools(server, config);
  registerResources(server, config);
  registerPrompts(server);

  return server;
}

export async function startServer(config: McpServerConfig = {}): Promise<void> {
  const server = createMcpServer(config);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
