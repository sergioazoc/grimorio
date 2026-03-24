import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { getDefaultTokens } from "grimorio-core";

export function registerInitProject(server: McpServer): void {
  server.tool(
    "init_project",
    "Initialize grimorio in a project: creates config file, specs directory, and default tokens",
    {
      path: z.string().default(".").describe("Project root directory (default: current directory)"),
    },
    async ({ path: projectRoot }) => {
      const created: string[] = [];

      const configPathMts = join(projectRoot, "grimorio.config.mts");
      const configPathTs = join(projectRoot, "grimorio.config.ts");
      if (!existsSync(configPathMts) && !existsSync(configPathTs)) {
        await writeFile(
          configPathMts,
          `export default {
  specs: './specs/**/*.json',
  tokens: './tokens.json',
  components: './src/components/**/*.{tsx,vue}',
  validation: {
    level: 'standard',
  },
}
`,
        );
        created.push("grimorio.config.mts");
      }

      const specsDir = join(projectRoot, "specs");
      if (!existsSync(specsDir)) {
        await mkdir(specsDir, { recursive: true });
        created.push("specs/");
      }

      const tokensPath = join(projectRoot, "tokens.json");
      if (!existsSync(tokensPath)) {
        await writeFile(tokensPath, JSON.stringify(getDefaultTokens(), null, 2) + "\n");
        created.push("tokens.json");
      }

      const message =
        created.length > 0
          ? `Initialized grimorio. Created: ${created.join(", ")}`
          : "Already initialized — all files exist.";

      return { content: [{ type: "text" as const, text: message }] };
    },
  );
}
