import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadAllSpecs, loadTokens, flattenTokens } from "grimorio-core";
import type { McpServerConfig } from "../server.js";

export function registerDesignSystemOverview(server: McpServer, config: McpServerConfig): void {
  server.resource("design-system-overview", "grimorio://design-system/overview", async () => {
    const specsDir = config.specs?.replace(/\/\*\*\/\*\.json$/, "") ?? "specs";
    const specsResult = await loadAllSpecs(specsDir);

    let markdown = "# Design System Overview\n\n";

    if (specsResult.ok) {
      markdown += `## Components (${specsResult.value.length})\n\n`;
      for (const spec of specsResult.value) {
        markdown += `### ${spec.name}\n`;
        if (spec.description) markdown += `${spec.description}\n`;
        markdown += `- Category: ${spec.category ?? "uncategorized"}\n`;
        markdown += `- Complexity: ${spec.complexity}\n`;
        markdown += `- Props: ${spec.props.length}\n`;
        markdown += `- Variants: ${spec.variants.length}\n\n`;
      }
    } else {
      markdown += "No specs found.\n\n";
    }

    if (config.tokens) {
      const tokensResult = await loadTokens(config.tokens);
      if (tokensResult.ok) {
        const flat = flattenTokens(tokensResult.value);
        markdown += `## Design Tokens (${flat.size})\n\n`;
        for (const [path, token] of flat) {
          const displayValue =
            typeof token.$value === "object" ? JSON.stringify(token.$value) : String(token.$value);
          markdown += `- \`${path}\`: ${displayValue}`;
          if (token.$description) markdown += ` — ${token.$description}`;
          markdown += "\n";
        }
      }
    }

    return {
      contents: [
        {
          uri: "grimorio://design-system/overview",
          mimeType: "text/markdown",
          text: markdown,
        },
      ],
    };
  });
}
