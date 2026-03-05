import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadTokens, flattenTokens } from "grimorio-core";
import type { TokenGroup } from "grimorio-core";
import type { McpServerConfig } from "../server.js";

function resolveParentType(path: string, tokens: TokenGroup): string | undefined {
  const segments = path.split(".");
  let group: TokenGroup | undefined = tokens;
  let type: string | undefined;
  for (let i = 0; i < segments.length - 1; i++) {
    const child = group[segments[i]];
    if (child && typeof child === "object" && !("$value" in child)) {
      group = child as TokenGroup;
      if (group.$type) type = group.$type;
    } else {
      break;
    }
  }
  return type;
}

export function registerGetTokens(server: McpServer, config: McpServerConfig): void {
  server.tool(
    "get_tokens",
    "Get design tokens, optionally filtered by path prefix or $type",
    {
      prefix: z.string().optional().describe('Filter tokens by path prefix (e.g., "color")'),
      type: z
        .string()
        .optional()
        .describe('Filter tokens by $type (e.g., "color", "dimension", "shadow")'),
    },
    async ({ prefix, type }) => {
      const tokensPath = config.tokens ?? "tokens.json";
      const result = await loadTokens(tokensPath);

      if (!result.ok) {
        return { content: [{ type: "text" as const, text: `Error: ${result.error}` }] };
      }

      const flat = flattenTokens(result.value);
      const entries: Record<string, Record<string, unknown>> = Object.create(null);

      for (const [path, token] of flat) {
        if (prefix && !path.startsWith(prefix)) continue;

        const tokenType = token.$type ?? resolveParentType(path, result.value);
        if (type && tokenType !== type) continue;

        const entry: Record<string, unknown> = { $value: token.$value };
        if (tokenType) entry.$type = tokenType;
        if (token.$description) entry.$description = token.$description;
        if (token.$deprecated) entry.$deprecated = token.$deprecated;
        entries[path] = entry;
      }

      return {
        content: [{ type: "text" as const, text: JSON.stringify(entries, null, 2) }],
      };
    },
  );
}
