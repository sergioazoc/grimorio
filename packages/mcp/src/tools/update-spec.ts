import { z } from "zod";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ComponentSpecSchema } from "grimorio-core";
import type { McpServerConfig } from "../server.js";

export function registerUpdateSpec(server: McpServer, config: McpServerConfig): void {
  server.tool(
    "update_spec",
    "Create or update a component spec. Validates the spec before writing. Use this after enriching a spec with accessibility, tokens, or guidelines.",
    {
      name: z.string().describe("Component name"),
      spec: z.string().describe("Full ComponentSpec as JSON string"),
    },
    async ({ name, spec: specJson }) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(specJson);
      } catch {
        return {
          content: [{ type: "text" as const, text: "Invalid JSON" }],
        };
      }

      const validation = ComponentSpecSchema.safeParse(parsed);
      if (!validation.success) {
        const errors = validation.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
        return {
          content: [
            {
              type: "text" as const,
              text: `Spec validation failed:\n${errors.join("\n")}`,
            },
          ],
        };
      }

      const specsDir = config.specs?.replace(/\/\*\*\/\*\.json$/, "") ?? "specs";
      const outputPath = join(specsDir, `${name.toLowerCase()}.json`);

      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, JSON.stringify(validation.data, null, 2) + "\n");

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ updated: outputPath, name: validation.data.name }, null, 2),
          },
        ],
      };
    },
  );
}
