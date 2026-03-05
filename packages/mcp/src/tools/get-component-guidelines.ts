import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadAllSpecs } from "grimorio-core";
import type { McpServerConfig } from "../server.js";

export function registerGetComponentGuidelines(server: McpServer, config: McpServerConfig): void {
  server.tool(
    "get_component_guidelines",
    "Get implementation guidelines for a component as a structured markdown checklist",
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

      let md = `# ${spec.name} — Implementation Guidelines\n\n`;

      if (spec.description) {
        md += `${spec.description}\n\n`;
      }

      // Required props
      const requiredProps = spec.props.filter((p) => p.required);
      if (requiredProps.length > 0) {
        md += `## Required Props\n`;
        for (const prop of requiredProps) {
          md += `- [ ] \`${prop.name}\`: \`${prop.type}\``;
          if (prop.description) md += ` — ${prop.description}`;
          md += "\n";
        }
        md += "\n";
      }

      // Optional props
      const optionalProps = spec.props.filter((p) => !p.required);
      if (optionalProps.length > 0) {
        md += `## Optional Props\n`;
        for (const prop of optionalProps) {
          md += `- [ ] \`${prop.name}\`: \`${prop.type}\``;
          if (prop.default !== undefined) md += ` (default: \`${JSON.stringify(prop.default)}\`)`;
          if (prop.description) md += ` — ${prop.description}`;
          md += "\n";
        }
        md += "\n";
      }

      // Variants
      if (spec.variants.length > 0) {
        md += `## Variants\n`;
        for (const variant of spec.variants) {
          md += `- [ ] \`${variant.name}\`: ${variant.values.map((v) => `\`${v}\``).join(", ")}`;
          if (variant.description) md += ` — ${variant.description}`;
          md += "\n";
        }
        if (Object.keys(spec.defaultVariants).length > 0) {
          md += `\nDefaults: ${Object.entries(spec.defaultVariants)
            .map(([k, v]) => `${k}="${v}"`)
            .join(", ")}\n`;
        }
        md += "\n";
      }

      // Accessibility checklist
      if (spec.accessibility) {
        md += `## Accessibility Checklist\n`;
        if (spec.accessibility.role) {
          md += `- [ ] Set \`role="${spec.accessibility.role}"\`\n`;
        }
        for (const attr of spec.accessibility.ariaAttributes) {
          md += `- [ ] Include \`${attr}\`\n`;
        }
        for (const interaction of spec.accessibility.keyboardInteractions) {
          md += `- [ ] Handle \`${interaction.key}\`: ${interaction.description}\n`;
        }
        md += "\n";
      }

      // Token Mapping
      const tokenEntries = Object.entries(spec.tokenMapping);
      if (tokenEntries.length > 0) {
        md += `## Token Mapping\n`;
        for (const [key, value] of tokenEntries) {
          md += `- \`${key}\` → \`${value}\`\n`;
        }
        md += "\n";
      }

      // States
      if (spec.states.length > 0) {
        md += `## States\n`;
        for (const state of spec.states) {
          md += `- [ ] \`${state}\`\n`;
        }
        md += "\n";
      }

      // Events
      if (spec.events.length > 0) {
        md += `## Events\n`;
        for (const event of spec.events) {
          md += `- [ ] \`${event.name}\``;
          if (event.description) md += ` — ${event.description}`;
          md += "\n";
        }
        md += "\n";
      }

      // Slots
      if (spec.slots.length > 0) {
        md += `## Slots\n`;
        for (const slot of spec.slots) {
          md += `- \`${slot.name}\`${slot.required ? " (required)" : ""}`;
          if (slot.description) md += ` — ${slot.description}`;
          md += "\n";
        }
        md += "\n";
      }

      // Anatomy
      if (spec.anatomy.length > 0) {
        md += `## Anatomy\n`;
        for (const part of spec.anatomy) {
          md += `- \`${part.name}\`${part.required ? "" : " (optional)"}`;
          if (part.description) md += ` — ${part.description}`;
          md += "\n";
        }
        md += "\n";
      }

      // Guidelines
      if (spec.guidelines.length > 0) {
        md += `## Usage Guidelines\n`;
        for (const guideline of spec.guidelines) {
          md += `- ${guideline}\n`;
        }
        md += "\n";
      }

      return {
        content: [{ type: "text" as const, text: md }],
      };
    },
  );
}
