import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadTokens, loadAllSpecs, flattenTokens, TokenFileSchema } from "grimorio-core";
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

export function registerValidateTokens(server: McpServer, config: McpServerConfig): void {
  server.tool(
    "validate_tokens",
    "Validate design tokens against schema and cross-reference with specs. Reports missing, deprecated, and orphan tokens.",
    {
      tokensPath: z.string().optional().describe("Path to tokens file (default: from config)"),
    },
    async ({ tokensPath: overridePath }) => {
      const tokensPath = overridePath ?? config.tokens ?? "tokens.json";
      const result = await loadTokens(tokensPath);

      if (!result.ok) {
        return {
          content: [{ type: "text" as const, text: `Error loading tokens: ${result.error}` }],
        };
      }

      const tokens = result.value;
      const issues: Array<{ severity: string; message: string }> = [];

      // Schema validation
      const schemaResult = TokenFileSchema.safeParse(tokens);
      if (!schemaResult.success) {
        for (const issue of schemaResult.error.issues) {
          issues.push({
            severity: "error",
            message: `Schema: ${issue.path.join(".")}: ${issue.message}`,
          });
        }
      }

      // Statistics
      const flat = flattenTokens(tokens);
      const typeCounts: Record<string, number> = {};
      let deprecatedCount = 0;

      for (const [path, token] of flat) {
        const type = token.$type ?? resolveParentType(path, tokens) ?? "unknown";
        typeCounts[type] = (typeCounts[type] ?? 0) + 1;
        if (token.$deprecated) deprecatedCount++;
      }

      // Cross-reference with specs
      const specsDir = config.specs?.replace(/\/\*\*\/\*\.json$/, "") ?? "specs";
      const specsResult = await loadAllSpecs(specsDir);

      const missing: string[] = [];
      const deprecatedUsed: string[] = [];
      const orphans: string[] = [];

      if (specsResult.ok) {
        const tokenPaths = new Set(flat.keys());
        const referencedTokens = new Set<string>();

        for (const spec of specsResult.value) {
          for (const ref of Object.values(spec.tokenMapping)) {
            // Extract token path from {token.path} reference format
            referencedTokens.add(ref.replace(/^\{|\}$/g, ""));
          }
        }

        for (const ref of referencedTokens) {
          if (!tokenPaths.has(ref)) missing.push(ref);
          else {
            const token = flat.get(ref);
            if (token?.$deprecated) deprecatedUsed.push(ref);
          }
        }

        for (const path of tokenPaths) {
          if (!referencedTokens.has(path)) orphans.push(path);
        }

        if (missing.length > 0) {
          for (const m of missing) {
            issues.push({ severity: "error", message: `Missing token: ${m}` });
          }
        }
        if (deprecatedUsed.length > 0) {
          for (const d of deprecatedUsed) {
            issues.push({ severity: "warning", message: `Deprecated token in use: ${d}` });
          }
        }
      }

      const valid = !issues.some((i) => i.severity === "error");

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                valid,
                totalTokens: flat.size,
                typeCounts,
                deprecatedCount,
                orphanCount: orphans.length,
                issueCount: issues.length,
                issues,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );
}
