import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadAllSpecs } from "grimorio-core";
import type { McpServerConfig } from "../server.js";

export function registerListComponents(server: McpServer, config: McpServerConfig): void {
  server.tool(
    "list_components",
    "List all component specs in the design system",
    {
      category: z.string().optional().describe("Filter by category"),
    },
    async ({ category }) => {
      const specsDir = config.specs?.replace(/\/\*\*\/\*\.json$/, "") ?? "specs";
      const result = await loadAllSpecs(specsDir);

      if (!result.ok) {
        return {
          content: [{ type: "text" as const, text: `Error loading specs: ${result.error}` }],
        };
      }

      let specs = result.value;
      if (category) {
        specs = specs.filter((s) => s.category === category);
      }

      const list = specs.map((s) => ({
        name: s.name,
        category: s.category ?? "uncategorized",
        complexity: s.complexity,
        propsCount: s.props.length,
        variantsCount: s.variants.length,
      }));

      return {
        content: [{ type: "text" as const, text: JSON.stringify(list, null, 2) }],
      };
    },
  );
}
