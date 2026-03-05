import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpServerConfig } from "../server.js";
import { registerDesignSystemOverview } from "./design-system-overview.js";
import { registerImplementationGuide } from "./implementation-guide.js";

export function registerResources(server: McpServer, config: McpServerConfig): void {
  registerDesignSystemOverview(server, config);
  registerImplementationGuide(server, config);
}
