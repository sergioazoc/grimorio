import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadAllSpecs } from "grimorio-core";
import type { McpServerConfig } from "../server.js";

export function registerGetComponent(server: McpServer, config: McpServerConfig): void {
  server.tool(
    "get_component",
    "Get the full spec for a specific component",
    {
      name: z.string().describe("Component name"),
    },
    async ({ name }) => {
      const specsDir = config.specs?.replace(/\/\*\*\/\*\.json$/, "") ?? "specs";
      const result = await loadAllSpecs(specsDir);

      if (!result.ok) {
        return { content: [{ type: "text" as const, text: `Error: ${result.error}` }] };
      }

      const spec = result.value.find((s) => s.name.toLowerCase() === name.toLowerCase());

      if (!spec) {
        return { content: [{ type: "text" as const, text: `Component "${name}" not found` }] };
      }

      return {
        content: [{ type: "text" as const, text: JSON.stringify(spec, null, 2) }],
      };
    },
  );
}
