import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { applyPreset, listPresetIds } from "grimorio-core";
import type { McpServerConfig } from "../server.js";

export function registerAddComponent(server: McpServer, config: McpServerConfig): void {
  server.tool(
    "add_component",
    "Add a component spec from a built-in preset or create a skeleton. Available presets: button, input, select, checkbox, textarea, dialog, card, avatar, badge, tabs.",
    {
      name: z.string().describe("Component name"),
      preset: z
        .string()
        .optional()
        .describe("Preset ID to use (auto-detected from name if matching)"),
      category: z.string().optional().describe("Component category override"),
      description: z.string().optional().describe("Component description override"),
    },
    async ({ name, preset, category, description }) => {
      const presetIds = listPresetIds();
      const presetId = preset ?? (presetIds.includes(name.toLowerCase()) ? name : undefined);

      const overrides: Record<string, unknown> = {};
      if (description) overrides.description = description;
      if (category) overrides.category = category;

      const spec = applyPreset(presetId ?? name, name, overrides);

      const specsDir = config.specs?.replace(/\/\*\*\/\*\.json$/, "") ?? "specs";
      const outputPath = join(specsDir, `${name.toLowerCase()}.json`);

      if (existsSync(outputPath)) {
        return {
          content: [{ type: "text" as const, text: `Spec already exists: ${outputPath}` }],
        };
      }

      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, JSON.stringify(spec, null, 2) + "\n");

      const usedPreset = presetId && presetIds.includes(presetId.toLowerCase());
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                created: outputPath,
                preset: usedPreset ? presetId.toLowerCase() : null,
                props: spec.props.length,
                variants: spec.variants.length,
                tokenMappings: Object.keys(spec.tokenMapping).length,
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
