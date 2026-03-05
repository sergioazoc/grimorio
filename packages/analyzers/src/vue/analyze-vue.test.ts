import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { analyzeVueFile } from "./analyze-vue.js";

const fixturesDir = join(fileURLToPath(import.meta.url), "../../fixtures");

describe("analyzeVueFile", () => {
  const source = readFileSync(join(fixturesDir, "Card.vue"), "utf-8");
  const result = analyzeVueFile("Card.vue", source);

  it("should detect framework as vue", () => {
    expect(result.framework).toBe("vue");
  });

  it("should extract props from defineProps with types", () => {
    expect(result.props.length).toBeGreaterThanOrEqual(2);
    const titleProp = result.props.find((p) => p.name === "title");
    expect(titleProp).toBeDefined();
    expect(titleProp?.required).toBe(true);
  });

  it("should extract withDefaults values", () => {
    const variantProp = result.props.find((p) => p.name === "variant");
    expect(variantProp).toBeDefined();
    expect(variantProp?.defaultValue).toBe("default");
  });

  it("should extract cva variants from script", () => {
    expect(result.variants.length).toBeGreaterThanOrEqual(2);
    const variantVariant = result.variants.find((v) => v.name === "variant");
    expect(variantVariant?.values).toContain("default");
    expect(variantVariant?.values).toContain("outlined");
  });

  it("should extract a11y from template", () => {
    const roleAttr = result.accessibilityAttrs.find((a) => a.name === "role");
    expect(roleAttr).toBeDefined();
    expect(roleAttr?.value).toBe("region");
  });
});
