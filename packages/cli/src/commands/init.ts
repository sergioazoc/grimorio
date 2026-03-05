import { defineCommand } from "citty";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import consola from "consola";
import { getDefaultTokens } from "grimorio-core";

export default defineCommand({
  meta: {
    name: "init",
    description: "Initialize grimorio in your project",
  },
  run: async () => {
    const cwd = process.cwd();

    // Create config file
    const configPath = join(cwd, "grimorio.config.ts");
    if (!existsSync(configPath)) {
      await writeFile(
        configPath,
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
      consola.success("Created grimorio.config.ts");
    } else {
      consola.info("grimorio.config.ts already exists");
    }

    // Create specs directory
    const specsDir = join(cwd, "specs");
    if (!existsSync(specsDir)) {
      await mkdir(specsDir, { recursive: true });
      consola.success("Created specs/ directory");
    }

    // Create tokens directory and example
    const tokensPath = join(cwd, "tokens.json");
    if (!existsSync(tokensPath)) {
      await writeFile(tokensPath, JSON.stringify(getDefaultTokens(), null, 2) + "\n");
      consola.success("Created tokens.json with default design tokens");
    }

    consola.box(
      "grimorio initialized! Next steps:\n1. Run `grimorio tokens:list` to see your design tokens\n2. Add component specs to specs/\n3. Run `grimorio validate` to check components",
    );
  },
});
