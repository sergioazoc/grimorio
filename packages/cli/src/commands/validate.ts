import { defineCommand } from "citty";
import { readFile } from "node:fs/promises";
import { watch } from "node:fs";
import { extname, dirname } from "node:path";
import consola from "consola";
import { glob } from "tinyglobby";
import { loadAllSpecs, loadTokens } from "grimorio-core";
import { analyzeReactFile, analyzeVueFile } from "grimorio-analyzers";
import { validate, type ValidationResult } from "grimorio-validators";
import { resolveConfig, type GrimorioConfig } from "../config.js";
import { formatResults } from "../utils/formatting.js";

async function runValidation(args: { level?: string }, config: GrimorioConfig): Promise<boolean> {
  const level = args.level ?? config.validation?.level ?? "standard";

  // Load specs
  const specsResult = await loadAllSpecs(config.specs?.replace(/\/\*\*\/\*\.json$/, "") ?? "specs");
  if (!specsResult.ok) {
    consola.error(`Failed to load specs: ${specsResult.error}`);
    return true;
  }
  const specs = specsResult.value;

  if (specs.length === 0) {
    consola.warn("No specs found. Run `grimorio init` and add specs to specs/ directory.");
    return false;
  }

  // Load tokens
  let tokens;
  const tokensPath = config.tokens;
  if (tokensPath && typeof tokensPath === "string") {
    const tokensResult = await loadTokens(tokensPath);
    if (tokensResult.ok) {
      tokens = tokensResult.value;
    }
  }

  // Find component files
  const componentFiles = await glob(config.components ?? "src/components/**/*.{tsx,vue}");

  if (componentFiles.length === 0) {
    consola.warn("No component files found.");
    return false;
  }

  const results: ValidationResult[] = [];

  for (const file of componentFiles) {
    const source = await readFile(file, "utf-8");
    const ext = extname(file);

    let analysis;
    if (ext === ".vue") {
      analysis = analyzeVueFile(file, source);
    } else {
      analysis = analyzeReactFile(file, source);
    }

    // Find matching spec
    const spec = specs.find((s) => s.name.toLowerCase() === analysis.name.toLowerCase());

    if (!spec) {
      consola.debug(`No spec found for ${analysis.name}`);
      continue;
    }

    const result = validate(analysis, spec, tokens, level as "basic" | "standard" | "strict");
    results.push(result);
  }

  formatResults(results);

  return results.some((r) => !r.valid);
}

export default defineCommand({
  meta: {
    name: "validate",
    description: "Validate components against their specs",
  },
  args: {
    level: {
      type: "string",
      alias: "l",
      description: "Validation level: basic, standard, strict",
    },
    watch: {
      type: "boolean",
      alias: "w",
      description: "Watch for changes and re-validate",
      default: false,
    },
  },
  run: async ({ args }) => {
    const config = await resolveConfig();
    const hasErrors = await runValidation(args, config);

    if (!args.watch) {
      if (hasErrors) process.exit(1);
      return;
    }

    consola.info("Watching for changes...");

    const specsDir = config.specs?.replace(/\/\*\*\/\*\.json$/, "") ?? "specs";
    const componentsDir = dirname(
      (config.components ?? "src/components/**/*.{tsx,vue}").replace(/\/\*\*\/.*$/, ""),
    );

    let debounceTimer: ReturnType<typeof setTimeout> | undefined;
    const onChange = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        void (async () => {
          consola.log("\n--- Re-validating ---\n");
          await runValidation(args, config);
          consola.info("Watching for changes...");
        })();
      }, 300);
    };

    watch(specsDir, { recursive: true }, onChange);
    watch(componentsDir, { recursive: true }, onChange);
  },
});
