import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadAllSpecs, loadTokens, flattenTokens } from "grimorio-core";
import type { TokenGroup } from "grimorio-core";
import type { McpServerConfig } from "../server.js";

export function registerImplementationGuide(server: McpServer, config: McpServerConfig): void {
  server.resource(
    "implementation-guide",
    "grimorio://design-system/implementation-guide",
    async () => {
      const specsDir = config.specs?.replace(/\/\*\*\/\*\.json$/, "") ?? "specs";
      const specsResult = await loadAllSpecs(specsDir);

      let md = `# Design System Implementation Guide\n\n`;
      md += `Use this guide as a system prompt when generating or reviewing UI code.\n\n`;

      md += `## Rules\n\n`;
      md += `1. Always use design tokens instead of hardcoded colors, spacing, or typography values.\n`;
      md += `2. Every interactive element must have keyboard support and appropriate ARIA attributes.\n`;
      md += `3. Follow the component spec — do not add props or variants not defined in the spec.\n`;
      md += `4. Use the specified role and aria attributes from each component's accessibility section.\n`;
      md += `5. Validate your implementation with \`validate_usage\` after generating code.\n\n`;

      // Available components
      if (specsResult.ok && specsResult.value.length > 0) {
        md += `## Available Components\n\n`;
        md += `| Component | Category | Props | Variants | Complexity |\n`;
        md += `|-----------|----------|-------|----------|------------|\n`;
        for (const spec of specsResult.value) {
          md += `| ${spec.name} | ${spec.category ?? "-"} | ${spec.props.length} | ${spec.variants.length} | ${spec.complexity} |\n`;
        }
        md += `\nUse \`get_component\` or \`get_component_guidelines\` to get full details.\n\n`;
      }

      // Available tokens
      if (config.tokens) {
        const tokensResult = await loadTokens(config.tokens);
        if (tokensResult.ok) {
          const flat = flattenTokens(tokensResult.value);
          if (flat.size > 0) {
            md += `## Available Design Tokens\n\n`;

            // Group by top-level category
            const groups = new Map<string, string[]>();
            for (const [path, token] of flat) {
              const category = path.split(".")[0] ?? "other";
              if (!groups.has(category)) groups.set(category, []);
              const displayValue =
                typeof token.$value === "object"
                  ? JSON.stringify(token.$value)
                  : String(token.$value);
              const tokenType = token.$type ?? resolveParentType(path, tokensResult.value);
              const typeTag = tokenType ? ` (${tokenType})` : "";
              groups.get(category)!.push(`\`${path}\`${typeTag}: ${displayValue}`);
            }

            for (const [category, entries] of groups) {
              md += `### ${category}\n`;
              for (const entry of entries) {
                md += `- ${entry}\n`;
              }
              md += "\n";
            }
          }
        }
      }

      md += `## Workflow\n\n`;
      md += `1. Use \`find_component\` to search for existing components before creating new ones.\n`;
      md += `2. Use \`get_component_guidelines\` to get the implementation checklist.\n`;
      md += `3. Implement the component following the spec.\n`;
      md += `4. Use \`validate_usage\` to check your implementation.\n`;
      md += `5. Fix any issues reported by the validator.\n`;

      return {
        contents: [
          {
            uri: "grimorio://design-system/implementation-guide",
            mimeType: "text/markdown",
            text: md,
          },
        ],
      };
    },
  );
}

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
