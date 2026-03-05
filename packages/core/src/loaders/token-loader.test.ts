import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadTokens, resolveTokenReference, flattenTokens } from "./token-loader.js";
import type { TokenGroup } from "../schemas/design-tokens.js";

const fixturesDir = join(fileURLToPath(import.meta.url), "../../fixtures");

describe("loadTokens", () => {
  it("should load tokens from file", async () => {
    const result = await loadTokens(join(fixturesDir, "tokens.json"));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.color).toBeDefined();
      expect(result.value.spacing).toBeDefined();
    }
  });

  it("should return error for non-existent file", async () => {
    const result = await loadTokens("/nonexistent/tokens.json");
    expect(result.ok).toBe(false);
  });
});

describe("resolveTokenReference", () => {
  const tokens: TokenGroup = {
    color: {
      primary: { $value: "#3b82f6" },
      nested: {
        deep: { $value: "#000" },
      },
    } as TokenGroup,
  };

  it("should resolve a simple reference", () => {
    const result = resolveTokenReference("color.primary", tokens);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.$value).toBe("#3b82f6");
    }
  });

  it("should resolve a curly-brace reference", () => {
    const result = resolveTokenReference("{color.primary}", tokens);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.$value).toBe("#3b82f6");
    }
  });

  it("should resolve nested references", () => {
    const result = resolveTokenReference("color.nested.deep", tokens);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.$value).toBe("#000");
    }
  });

  it("should return error for non-existent reference", () => {
    const result = resolveTokenReference("color.nonexistent", tokens);
    expect(result.ok).toBe(false);
  });
});

describe("flattenTokens", () => {
  it("should flatten nested tokens", () => {
    const group: TokenGroup = {
      color: {
        primary: { $value: "#3b82f6" },
        secondary: { $value: "#64748b" },
      } as TokenGroup,
      spacing: {
        sm: { $value: "0.5rem" },
      } as TokenGroup,
    };

    const flat = flattenTokens(group);
    expect(flat.size).toBe(3);
    expect(flat.get("color.primary")?.$value).toBe("#3b82f6");
    expect(flat.get("color.secondary")?.$value).toBe("#64748b");
    expect(flat.get("spacing.sm")?.$value).toBe("0.5rem");
  });

  it("should skip $ prefixed keys", () => {
    const group: TokenGroup = {
      $type: "color",
      primary: { $value: "#3b82f6" },
    };

    const flat = flattenTokens(group);
    expect(flat.size).toBe(1);
    expect(flat.get("primary")?.$value).toBe("#3b82f6");
  });
});
