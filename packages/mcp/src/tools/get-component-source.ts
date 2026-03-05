import { z } from "zod";
import { readFile } from "node:fs/promises";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerGetComponentSource(server: McpServer): void {
  server.tool(
    "get_component_source",
    "Read the source code of a component file",
    {
      path: z.string().describe("Path to the component file"),
    },
    async ({ path }) => {
      try {
        const source = await readFile(path, "utf-8");
        return {
          content: [{ type: "text" as const, text: source }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error reading file: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    },
  );
}
