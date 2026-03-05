import { defineCommand } from "citty";
import consola from "consola";
import { loadTokens, flattenTokens, formatTokenValue } from "grimorio-core";
import type { DesignToken, TokenGroup } from "grimorio-core";
import { resolveConfig } from "../config.js";
import { resolveTokensPaths } from "../utils/tokens.js";

function isDesignToken(v: unknown): v is DesignToken {
  return typeof v === "object" && v !== null && "$value" in v;
}

function printTree(group: TokenGroup, indent: number = 0, parentType?: string): void {
  for (const [key, value] of Object.entries(group)) {
    if (key.startsWith("$")) continue;
    const pad = "  ".repeat(indent);
    if (isDesignToken(value)) {
      const type = value.$type ?? parentType ?? "";
      const desc = value.$description ? ` — ${value.$description}` : "";
      const typeTag = type ? ` (${type})` : "";
      consola.log(`${pad}${key}${typeTag}: ${formatTokenValue(value.$value)}${desc}`);
    } else if (typeof value === "object" && value !== null) {
      const g = value as TokenGroup;
      const typeTag = g.$type ? ` (${g.$type})` : "";
      const desc = g.$description ? ` — ${g.$description}` : "";
      consola.log(`${pad}${key}${typeTag}${desc}`);
      printTree(g, indent + 1, g.$type ?? parentType);
    }
  }
}

export default defineCommand({
  meta: {
    name: "tokens:list",
    description: "List design tokens",
  },
  args: {
    flat: {
      type: "boolean",
      description: "Show flat list instead of tree",
      default: false,
    },
    type: {
      type: "string",
      description: "Filter by $type (e.g., color, dimension)",
    },
    json: {
      type: "boolean",
      description: "Output as JSON",
      default: false,
    },
    theme: {
      type: "string",
      description: "Theme to list (for multi-theme configs)",
    },
  },
  run: async ({ args }) => {
    const config = await resolveConfig();
    const paths = resolveTokensPaths(config);
    const themeName = args.theme ?? "default";
    const tokensPath = paths.get(themeName) ?? paths.values().next().value ?? "./tokens.json";
    const result = await loadTokens(tokensPath);
    if (!result.ok) {
      consola.error(result.error);
      process.exit(1);
    }

    const tokens = result.value;

    if (args.json) {
      if (args.flat) {
        const flat = flattenTokens(tokens);
        const obj: Record<string, unknown> = {};
        for (const [path, token] of flat) {
          if (args.type && !matchesType(path, token, tokens, args.type)) continue;
          obj[path] = token;
        }
        consola.log(JSON.stringify(obj, null, 2));
      } else {
        consola.log(JSON.stringify(tokens, null, 2));
      }
      return;
    }

    if (args.flat) {
      const flat = flattenTokens(tokens);
      for (const [path, token] of flat) {
        const type = token.$type ?? resolveParentType(path, tokens) ?? "";
        if (args.type && type !== args.type) continue;
        const typeTag = type ? ` (${type})` : "";
        const desc = token.$description ? ` — ${token.$description}` : "";
        consola.log(`${path}${typeTag}: ${formatTokenValue(token.$value)}${desc}`);
      }
      return;
    }

    if (args.type) {
      // Tree view filtered by type
      for (const [key, value] of Object.entries(tokens)) {
        if (key.startsWith("$")) continue;
        if (typeof value === "object" && value !== null && !isDesignToken(value)) {
          const g = value as TokenGroup;
          if (g.$type === args.type) {
            const desc = g.$description ? ` — ${g.$description}` : "";
            consola.log(`${key} (${g.$type})${desc}`);
            printTree(g, 1, g.$type);
          }
        }
      }
      return;
    }

    printTree(tokens);
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

function matchesType(path: string, token: DesignToken, tokens: TokenGroup, type: string): boolean {
  if (token.$type === type) return true;
  return resolveParentType(path, tokens) === type;
}
