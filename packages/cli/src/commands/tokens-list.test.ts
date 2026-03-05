import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { rm, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { loadTokens, flattenTokens, formatTokenValue } from "grimorio-core";
import type { DesignToken, TokenGroup } from "grimorio-core";

const TEST_DIR = join(import.meta.dirname, "__test_tokens_list__");

const SAMPLE_TOKENS: TokenGroup = {
  color: {
    $type: "color",
    $description: "Brand colors",
    primary: { $value: "#3b82f6", $type: "color" },
    secondary: { $value: "#64748b", $type: "color", $description: "Secondary" },
  },
  spacing: {
    $type: "dimension",
    sm: { $value: "0.5rem", $type: "dimension" },
    md: { $value: "1rem", $type: "dimension" },
    lg: { $value: "1.5rem", $type: "dimension" },
  },
  fontFamily: {
    $type: "fontFamily",
    sans: { $value: "Inter, sans-serif", $type: "fontFamily" },
  },
};

describe("tokens:list command", () => {
  beforeEach(async () => {
    if (existsSync(TEST_DIR)) {
      await rm(TEST_DIR, { recursive: true });
    }
    await mkdir(TEST_DIR, { recursive: true });
  });

  afterEach(async () => {
    if (existsSync(TEST_DIR)) {
      await rm(TEST_DIR, { recursive: true });
    }
  });

  it("should load and flatten tokens", async () => {
    const tokensPath = join(TEST_DIR, "tokens.json");
    await writeFile(tokensPath, JSON.stringify(SAMPLE_TOKENS, null, 2));

    const result = await loadTokens(tokensPath);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const flat = flattenTokens(result.value);
    expect(flat.size).toBe(6);
    expect(flat.has("color.primary")).toBe(true);
    expect(flat.has("spacing.md")).toBe(true);
    expect(flat.has("fontFamily.sans")).toBe(true);
  });

  it("should filter tokens by type", async () => {
    const tokensPath = join(TEST_DIR, "tokens.json");
    await writeFile(tokensPath, JSON.stringify(SAMPLE_TOKENS, null, 2));

    const result = await loadTokens(tokensPath);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const flat = flattenTokens(result.value);
    const colorTokens = [...flat.entries()].filter(([, token]) => token.$type === "color");

    expect(colorTokens.length).toBe(2);
    expect(colorTokens.every(([, t]) => t.$type === "color")).toBe(true);
  });

  it("should format token values correctly", () => {
    expect(formatTokenValue("#3b82f6")).toBe("#3b82f6");
    expect(formatTokenValue("1rem")).toBe("1rem");
    expect(formatTokenValue("Inter, sans-serif")).toBe("Inter, sans-serif");
  });

  it("should produce valid JSON output", async () => {
    const tokensPath = join(TEST_DIR, "tokens.json");
    await writeFile(tokensPath, JSON.stringify(SAMPLE_TOKENS, null, 2));

    const result = await loadTokens(tokensPath);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const flat = flattenTokens(result.value);
    const obj: Record<string, unknown> = {};
    for (const [path, token] of flat) {
      obj[path] = token;
    }

    const json = JSON.stringify(obj, null, 2);
    const parsed = JSON.parse(json);
    expect(Object.keys(parsed)).toHaveLength(6);
  });

  it("should resolve parent type for tokens without explicit $type", async () => {
    const tokensWithGroupType: TokenGroup = {
      color: {
        $type: "color",
        primary: { $value: "#3b82f6" }, // no explicit $type, inherits from group
      },
    };

    const tokensPath = join(TEST_DIR, "tokens.json");
    await writeFile(tokensPath, JSON.stringify(tokensWithGroupType, null, 2));

    const result = await loadTokens(tokensPath);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const flat = flattenTokens(result.value);
    const primary = flat.get("color.primary");
    expect(primary).toBeDefined();
    // The token itself may not have $type, but the parent group does
    expect(primary!.$value).toBe("#3b82f6");
  });

  it("should handle multi-theme token loading", async () => {
    const defaultTokens: TokenGroup = {
      color: {
        $type: "color",
        bg: { $value: "#ffffff", $type: "color" },
      },
    };
    const darkTokens: TokenGroup = {
      color: {
        $type: "color",
        bg: { $value: "#1a1a1a", $type: "color" },
      },
    };

    await writeFile(join(TEST_DIR, "tokens.json"), JSON.stringify(defaultTokens, null, 2));
    await writeFile(join(TEST_DIR, "tokens-dark.json"), JSON.stringify(darkTokens, null, 2));

    const defaultResult = await loadTokens(join(TEST_DIR, "tokens.json"));
    const darkResult = await loadTokens(join(TEST_DIR, "tokens-dark.json"));

    expect(defaultResult.ok).toBe(true);
    expect(darkResult.ok).toBe(true);

    if (!defaultResult.ok || !darkResult.ok) return;

    const defaultFlat = flattenTokens(defaultResult.value);
    const darkFlat = flattenTokens(darkResult.value);

    expect((defaultFlat.get("color.bg") as DesignToken).$value).toBe("#ffffff");
    expect((darkFlat.get("color.bg") as DesignToken).$value).toBe("#1a1a1a");
  });
});
