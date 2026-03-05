import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadAllSpecs } from "grimorio-core";
import type { McpServerConfig } from "../server.js";

export function registerFindComponent(server: McpServer, config: McpServerConfig): void {
  server.tool(
    "find_component",
    "Search for components by description or name",
    {
      query: z.string().describe("Search query"),
    },
    async ({ query }) => {
      const specsDir = config.specs?.replace(/\/\*\*\/\*\.json$/, "") ?? "specs";
      const result = await loadAllSpecs(specsDir);

      if (!result.ok) {
        return { content: [{ type: "text" as const, text: `Error: ${result.error}` }] };
      }

      const queryLower = query.toLowerCase();
      const matches = result.value.filter(
        (s) =>
          s.name.toLowerCase().includes(queryLower) ||
          s.description?.toLowerCase().includes(queryLower) ||
          s.category?.toLowerCase().includes(queryLower) ||
          s.guidelines.some((g) => g.toLowerCase().includes(queryLower)),
      );

      if (matches.length === 0) {
        return {
          content: [{ type: "text" as const, text: `No components found matching "${query}"` }],
        };
      }

      const results = matches.map((s) => ({
        name: s.name,
        description: s.description,
        category: s.category,
      }));

      return {
        content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }],
      };
    },
  );
}
