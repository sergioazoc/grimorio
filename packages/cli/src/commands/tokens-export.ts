import { defineCommand } from "citty";
import { writeFile } from "node:fs/promises";
import consola from "consola";
import { loadTokens, exportTokens, exportCssThemed } from "grimorio-core";
import type { TokenGroup } from "grimorio-core";
import { resolveConfig } from "../config.js";
import { resolveTokensPaths } from "../utils/tokens.js";

export default defineCommand({
  meta: {
    name: "tokens:export",
    description: "Export design tokens to CSS, SCSS, JS, or Tailwind format",
  },
  args: {
    format: {
      type: "positional",
      description: "Export format: css, scss, js, tailwind",
      required: true,
    },
    output: {
      type: "string",
      alias: "o",
      description: "Output file path (default: stdout)",
    },
    prefix: {
      type: "string",
      description: "Prefix for CSS/SCSS variable names",
    },
    "no-descriptions": {
      type: "boolean",
      description: "Omit description comments",
      default: false,
    },
    theme: {
      type: "string",
      description: "Export only a specific theme (for multi-theme configs)",
    },
  },
  run: async ({ args }) => {
    const config = await resolveConfig();
    const paths = resolveTokensPaths(config);
    const exportOptions = {
      prefix: args.prefix,
      includeDescriptions: !args["no-descriptions"],
    };

    // Multi-theme CSS: all themes in one file
    if (paths.size > 1 && args.format === "css" && !args.theme) {
      const themes = new Map<string, TokenGroup>();
      for (const [name, tokenPath] of paths) {
        const loadResult = await loadTokens(tokenPath);
        if (!loadResult.ok) {
          consola.error(`Failed to load theme "${name}": ${loadResult.error}`);
          process.exit(1);
        }
        themes.set(name, loadResult.value);
      }

      const result = exportCssThemed(themes, exportOptions);
      if (!result.ok) {
        consola.error(result.error);
        process.exit(1);
      }

      if (args.output) {
        await writeFile(args.output, result.value);
        consola.success(`Tokens exported to ${args.output}`);
      } else {
        process.stdout.write(result.value);
      }
      return;
    }

    // Determine which theme to use
    let themeName = args.theme ?? "default";
    let tokensPath = paths.get(themeName);
    if (!tokensPath) {
      // If single-string config, use it directly
      if (paths.size === 1) {
        tokensPath = paths.values().next().value ?? "./tokens.json";
      } else {
        consola.error(`Theme "${themeName}" not found. Available: ${[...paths.keys()].join(", ")}`);
        process.exit(1);
      }
    }

    const loadResult = await loadTokens(tokensPath);
    if (!loadResult.ok) {
      consola.error(loadResult.error);
      process.exit(1);
    }

    const result = exportTokens(loadResult.value, args.format, exportOptions);

    if (!result.ok) {
      consola.error(result.error);
      process.exit(1);
    }

    if (args.output) {
      await writeFile(args.output, result.value);
      consola.success(`Tokens exported to ${args.output}`);
    } else {
      process.stdout.write(result.value);
    }
  },
});
