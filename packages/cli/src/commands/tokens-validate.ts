import { defineCommand } from "citty";
import { watch } from "node:fs";
import { dirname } from "node:path";
import consola from "consola";
import { loadTokens, loadAllSpecs, flattenTokens, TokenFileSchema } from "grimorio-core";
import type { TokenGroup } from "grimorio-core";
import { resolveConfig, type GrimorioConfig } from "../config.js";
import { resolveTokensPaths } from "../utils/tokens.js";
import { glob } from "tinyglobby";

async function runTokensValidation(config: GrimorioConfig): Promise<boolean> {
  const tokensPath = typeof config.tokens === "string" ? config.tokens : "./tokens.json";
  const result = await loadTokens(tokensPath);
  if (!result.ok) {
    consola.error(`Failed to load tokens: ${result.error}`);
    return true;
  }

  const tokens = result.value;
  let hasErrors = false;

  // 1. Validate against schema
  const schemaResult = TokenFileSchema.safeParse(tokens);
  if (!schemaResult.success) {
    consola.error("Token file has schema errors:");
    for (const issue of schemaResult.error.issues) {
      consola.error(`  ${issue.path.join(".")}: ${issue.message}`);
    }
    hasErrors = true;
  } else {
    consola.success("Token file passes schema validation");
  }

  // 2. Statistics
  const flat = flattenTokens(tokens);
  const typeCounts = new Map<string, number>();
  let deprecatedCount = 0;

  for (const [path, token] of flat) {
    const type = token.$type ?? resolveParentType(path, tokens) ?? "unknown";
    typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
    if (token.$deprecated) deprecatedCount++;
  }

  consola.info(`Total tokens: ${flat.size}`);
  for (const [type, count] of [...typeCounts.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    consola.info(`  ${type}: ${count}`);
  }
  if (deprecatedCount > 0) {
    consola.warn(`Deprecated tokens: ${deprecatedCount}`);
  }

  // 3. Cross-reference with specs
  const specsGlob = config.specs ?? "./specs/**/*.json";
  const specsDir = specsGlob.replace(/\/\*\*\/\*\.json$/, "");
  const specFiles = await glob(specsGlob);

  if (specFiles.length === 0) {
    consola.info("No specs found, skipping cross-reference");
    return hasErrors;
  }

  const specsResult = await loadAllSpecs(specsDir);
  if (!specsResult.ok) {
    consola.warn(`Could not load specs: ${specsResult.error}`);
    return hasErrors;
  }

  const specs = specsResult.value;
  const tokenPaths = new Set(flat.keys());
  const referencedTokens = new Set<string>();

  // Collect token references from all specs (from tokenMapping values)
  for (const spec of specs) {
    for (const ref of Object.values(spec.tokenMapping)) {
      // Extract token path from {token.path} reference format
      referencedTokens.add(ref.replace(/^\{|\}$/g, ""));
    }
  }

  // Missing: referenced in specs but not defined
  const missing: string[] = [];
  for (const ref of referencedTokens) {
    if (!tokenPaths.has(ref)) {
      missing.push(ref);
    }
  }

  // Deprecated used: deprecated tokens referenced in specs
  const deprecatedUsed: string[] = [];
  for (const ref of referencedTokens) {
    if (tokenPaths.has(ref)) {
      const token = flat.get(ref);
      if (token?.$deprecated) {
        deprecatedUsed.push(ref);
      }
    }
  }

  // Orphans: defined but not referenced
  const orphans: string[] = [];
  for (const path of tokenPaths) {
    if (!referencedTokens.has(path)) {
      orphans.push(path);
    }
  }

  if (missing.length > 0) {
    consola.error(`Missing tokens (referenced in specs but not defined): ${missing.length}`);
    for (const m of missing) {
      consola.error(`  ${m}`);
    }
    hasErrors = true;
  }

  if (deprecatedUsed.length > 0) {
    consola.warn(`Deprecated tokens in use: ${deprecatedUsed.length}`);
    for (const d of deprecatedUsed) {
      consola.warn(`  ${d}`);
    }
  }

  if (orphans.length > 0) {
    consola.info(`Orphan tokens (defined but not in any spec): ${orphans.length}`);
  }

  if (!hasErrors) {
    consola.success("Token validation passed");
  }

  return hasErrors;
}

export default defineCommand({
  meta: {
    name: "tokens:validate",
    description: "Validate design tokens and cross-reference with specs",
  },
  args: {
    watch: {
      type: "boolean",
      alias: "w",
      description: "Watch for changes and re-validate",
      default: false,
    },
  },
  run: async ({ args }) => {
    const config = await resolveConfig();
    const paths = resolveTokensPaths(config);
    let hasErrors = false;

    for (const [name, tokenPath] of paths) {
      if (paths.size > 1) consola.info(`\nTheme: ${name}`);
      const themeConfig = { ...config, tokens: tokenPath };
      const themeErrors = await runTokensValidation(themeConfig);
      if (themeErrors) hasErrors = true;
    }

    if (!args.watch) {
      if (hasErrors) process.exit(1);
      return;
    }

    consola.info("Watching for changes...");

    const firstTokensPath = paths.values().next().value ?? "./tokens.json";
    const specsDir = (config.specs ?? "./specs/**/*.json").replace(/\/\*\*\/\*\.json$/, "");

    let debounceTimer: ReturnType<typeof setTimeout> | undefined;
    const onChange = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        void (async () => {
          consola.log("\n--- Re-validating tokens ---\n");
          for (const [name, tokenPath] of paths) {
            if (paths.size > 1) consola.info(`\nTheme: ${name}`);
            await runTokensValidation({ ...config, tokens: tokenPath });
          }
          consola.info("Watching for changes...");
        })();
      }, 300);
    };

    watch(dirname(firstTokensPath), { recursive: true }, onChange);
    watch(specsDir, { recursive: true }, onChange);
  },
});

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
