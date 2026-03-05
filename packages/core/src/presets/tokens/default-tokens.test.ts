import { describe, it, expect } from "vitest";
import { getDefaultTokens } from "./default-tokens.js";
import { TokenFileSchema, DesignTokenSchema } from "../../schemas/design-tokens.js";
import { flattenTokens } from "../../loaders/token-loader.js";

describe("getDefaultTokens", () => {
  it("should validate against TokenFileSchema", () => {
    const tokens = getDefaultTokens();
    const result = TokenFileSchema.safeParse(tokens);
    expect(result.success).toBe(true);
  });

  it("should return a fresh copy each time", () => {
    const a = getDefaultTokens();
    const b = getDefaultTokens();
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });

  it("should contain all 13 categories", () => {
    const tokens = getDefaultTokens();
    const categories = Object.keys(tokens).filter((k) => !k.startsWith("$"));
    expect(categories).toEqual([
      "color",
      "spacing",
      "fontSize",
      "fontFamily",
      "fontWeight",
      "lineHeight",
      "letterSpacing",
      "borderRadius",
      "shadow",
      "opacity",
      "zIndex",
      "duration",
      "easing",
    ]);
  });

  it("every individual token should validate against DesignTokenSchema", () => {
    const tokens = getDefaultTokens();
    const flat = flattenTokens(tokens);
    for (const [path, token] of flat) {
      const result = DesignTokenSchema.safeParse(token);
      expect(result.success, `Token "${path}" failed validation`).toBe(true);
    }
  });

  it("every group should have $type", () => {
    const tokens = getDefaultTokens();
    for (const [key, group] of Object.entries(tokens)) {
      if (key.startsWith("$")) continue;
      expect(
        (group as Record<string, unknown>).$type,
        `Group "${key}" missing $type`,
      ).toBeDefined();
    }
  });

  it("should have expected token counts per category", () => {
    const tokens = getDefaultTokens();
    const flat = flattenTokens(tokens);
    const counts = new Map<string, number>();
    for (const [path] of flat) {
      const category = path.split(".")[0];
      counts.set(category, (counts.get(category) ?? 0) + 1);
    }
    expect(counts.get("color")).toBe(11);
    expect(counts.get("spacing")).toBe(14);
    expect(counts.get("fontSize")).toBe(8);
    expect(counts.get("fontFamily")).toBe(3);
    expect(counts.get("fontWeight")).toBe(7);
    expect(counts.get("lineHeight")).toBe(6);
    expect(counts.get("letterSpacing")).toBe(5);
    expect(counts.get("borderRadius")).toBe(7);
    expect(counts.get("shadow")).toBe(5);
    expect(counts.get("opacity")).toBe(7);
    expect(counts.get("zIndex")).toBe(6);
    expect(counts.get("duration")).toBe(8);
    expect(counts.get("easing")).toBe(4);
  });
});
