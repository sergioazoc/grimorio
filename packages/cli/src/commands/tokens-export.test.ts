import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFile, rm, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { getDefaultTokens, exportTokens, loadTokens, exportCssThemed } from "grimorio-core";
import type { TokenGroup } from "grimorio-core";

const TEST_DIR = join(import.meta.dirname, "__test_tokens_export__");

const SIMPLE_TOKENS: TokenGroup = {
  color: {
    $type: "color",
    primary: {
      $value: "#3b82f6",
      $type: "color",
    },
    secondary: {
      $value: "#64748b",
      $type: "color",
      $description: "Secondary brand color",
    },
  },
  spacing: {
    $type: "dimension",
    sm: { $value: "0.5rem", $type: "dimension" },
    md: { $value: "1rem", $type: "dimension" },
  },
};

describe("tokens:export command", () => {
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

  it("should export tokens to CSS format", () => {
    const result = exportTokens(SIMPLE_TOKENS, "css");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toContain(":root");
    expect(result.value).toContain("--color-primary");
    expect(result.value).toContain("#3b82f6");
  });

  it("should export tokens to SCSS format", () => {
    const result = exportTokens(SIMPLE_TOKENS, "scss");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toContain("$color-primary");
    expect(result.value).toContain("#3b82f6");
  });

  it("should export tokens to JS format", () => {
    const result = exportTokens(SIMPLE_TOKENS, "js");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toContain("export");
    expect(result.value).toContain("color");
    expect(result.value).toContain("#3b82f6");
  });

  it("should export tokens to Tailwind format", () => {
    const result = exportTokens(SIMPLE_TOKENS, "tailwind");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toContain("export");
    expect(result.value).toContain("color");
  });

  it("should apply prefix to CSS variables", () => {
    const result = exportTokens(SIMPLE_TOKENS, "css", { prefix: "ds" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toContain("--ds-color-primary");
  });

  it("should include descriptions by default", () => {
    const result = exportTokens(SIMPLE_TOKENS, "css");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toContain("Secondary brand color");
  });

  it("should omit descriptions when disabled", () => {
    const result = exportTokens(SIMPLE_TOKENS, "css", { includeDescriptions: false });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).not.toContain("Secondary brand color");
  });

  it("should export default tokens to file", async () => {
    const tokens = getDefaultTokens();
    const result = exportTokens(tokens, "css");
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const outputPath = join(TEST_DIR, "tokens.css");
    await writeFile(outputPath, result.value);
    const content = await readFile(outputPath, "utf-8");
    expect(content).toContain(":root");
    expect(content.length).toBeGreaterThan(100);
  });

  it("should handle multi-theme CSS export", () => {
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

    const themes = new Map<string, TokenGroup>([
      ["default", defaultTokens],
      ["dark", darkTokens],
    ]);

    const result = exportCssThemed(themes);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toContain(":root");
    expect(result.value).toContain("#ffffff");
    expect(result.value).toContain('[data-theme="dark"]');
    expect(result.value).toContain("#1a1a1a");
  });

  it("should reject invalid format", () => {
    const result = exportTokens(SIMPLE_TOKENS, "xml" as "css");
    expect(result.ok).toBe(false);
  });

  it("should roundtrip tokens through file", async () => {
    const tokensPath = join(TEST_DIR, "tokens.json");
    await writeFile(tokensPath, JSON.stringify(SIMPLE_TOKENS, null, 2));

    const loadResult = await loadTokens(tokensPath);
    expect(loadResult.ok).toBe(true);
    if (!loadResult.ok) return;

    const exportResult = exportTokens(loadResult.value, "css");
    expect(exportResult.ok).toBe(true);
    if (!exportResult.ok) return;
    expect(exportResult.value).toContain("--color-primary");
    expect(exportResult.value).toContain("--spacing-sm");
  });
});
