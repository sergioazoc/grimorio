import { readFile } from "node:fs/promises";
import { type Result, ok, err } from "../result.js";
import type { DesignToken, TokenGroup } from "../schemas/design-tokens.js";

export async function loadTokens(filePath: string): Promise<Result<TokenGroup, string>> {
  try {
    const content = await readFile(filePath, "utf-8");
    const data = JSON.parse(content);
    return ok(data as TokenGroup);
  } catch (error) {
    return err(
      `Failed to load tokens at ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function isDesignToken(value: unknown): value is DesignToken {
  return typeof value === "object" && value !== null && "$value" in value;
}

export function resolveTokenReference(
  ref: string,
  tokens: TokenGroup,
): Result<DesignToken, string> {
  // ref format: "{color.primary}" or "color.primary"
  const path = ref.replace(/^\{|\}$/g, "").split(".");
  let current: unknown = tokens;

  for (const segment of path) {
    if (typeof current !== "object" || current === null) {
      return err(`Token reference "${ref}" not found: path segment "${segment}" is not an object`);
    }
    current = (current as Record<string, unknown>)[segment];
    if (current === undefined) {
      return err(`Token reference "${ref}" not found: "${segment}" does not exist`);
    }
  }

  if (!isDesignToken(current)) {
    return err(`Token reference "${ref}" does not resolve to a token`);
  }

  return ok(current);
}

export function flattenTokens(group: TokenGroup, prefix: string = ""): Map<string, DesignToken> {
  const result = new Map<string, DesignToken>();

  for (const [key, value] of Object.entries(group)) {
    if (key.startsWith("$")) continue;

    const path = prefix ? `${prefix}.${key}` : key;

    if (isDesignToken(value)) {
      result.set(path, value);
    } else if (typeof value === "object" && value !== null) {
      const nested = flattenTokens(value as TokenGroup, path);
      for (const [nestedPath, nestedToken] of nested) {
        result.set(nestedPath, nestedToken);
      }
    }
  }

  return result;
}
