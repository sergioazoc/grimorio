import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadTokens, exportTokens } from "grimorio-core";
import type { McpServerConfig } from "../server.js";

export function registerExportTokens(server: McpServer, config: McpServerConfig): void {
  server.tool(
    "export_tokens",
    "Export design tokens to CSS, SCSS, JS, or Tailwind format",
    {
      format: z.enum(["css", "scss", "js", "tailwind"]).describe("Export format"),
      tokensPath: z.string().optional().describe("Path to tokens file (default: from config)"),
      prefix: z.string().optional().describe("Prefix for CSS/SCSS variable names"),
      includeDescriptions: z.boolean().default(true).describe("Include description comments"),
    },
    async ({ format, tokensPath: overridePath, prefix, includeDescriptions }) => {
      const tokensPath = overridePath ?? config.tokens ?? "tokens.json";
      const loadResult = await loadTokens(tokensPath);

      if (!loadResult.ok) {
        return {
          content: [{ type: "text" as const, text: `Error: ${loadResult.error}` }],
        };
      }

      const result = exportTokens(loadResult.value, format, { prefix, includeDescriptions });

      if (!result.ok) {
        return {
          content: [{ type: "text" as const, text: `Export error: ${result.error}` }],
        };
      }

      return {
        content: [{ type: "text" as const, text: result.value }],
      };
    },
  );
}
