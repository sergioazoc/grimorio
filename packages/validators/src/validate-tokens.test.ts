import { describe, it, expect } from "vitest";
import { validateTokens } from "./validate-tokens.js";
import type { ComponentSpec, TokenGroup } from "grimorio-core";
import type { AnalyzedComponent } from "grimorio-analyzers";

const makeSpec = (overrides: Partial<ComponentSpec> = {}): ComponentSpec => ({
  name: "Button",
  complexity: "moderate",
  props: [],
  variants: [],
  defaultVariants: {},
  slots: [],
  anatomy: [],
  tokenMapping: { "root.background": "{color.primary}" },
  states: [],
  events: [],
  dependencies: [],
  guidelines: [],
  ...overrides,
});

const makeAnalysis = (overrides: Partial<AnalyzedComponent> = {}): AnalyzedComponent => ({
  name: "Button",
  filePath: "Button.tsx",
  framework: "react",
  props: [],
  variants: [],
  tailwindClasses: [],
  accessibilityAttrs: [],
  imports: [],
  exports: [],
  ...overrides,
});

describe("validateTokens", () => {
  it("should pass with no hardcoded values", () => {
    const analysis = makeAnalysis({ tailwindClasses: ["bg-blue-500", "text-white"] });
    const issues = validateTokens(analysis, makeSpec(), undefined, "standard");
    const hardcoded = issues.filter((i) => i.code === "HARDCODED_VALUE");
    expect(hardcoded).toHaveLength(0);
  });

  it("should detect hardcoded color in tailwind class", () => {
    const analysis = makeAnalysis({ tailwindClasses: ["bg-[#ff0000]", "text-white"] });
    const issues = validateTokens(analysis, makeSpec(), undefined, "standard");
    const hardcoded = issues.filter((i) => i.code === "HARDCODED_VALUE");
    expect(hardcoded.length).toBeGreaterThan(0);
    expect(hardcoded[0].actual).toBe("bg-[#ff0000]");
  });

  it("should detect missing token in strict mode", () => {
    const tokens: TokenGroup = {
      color: {
        secondary: { $value: "#64748b" },
      } as TokenGroup,
    };
    const issues = validateTokens(makeAnalysis(), makeSpec(), tokens, "strict");
    const missing = issues.find((i) => i.code === "MISSING_TOKEN");
    expect(missing).toBeDefined();
    expect(missing?.expected).toBe("color.primary");
  });

  it("should skip token validation in basic mode", () => {
    const analysis = makeAnalysis({ tailwindClasses: ["bg-[#ff0000]"] });
    const issues = validateTokens(analysis, makeSpec(), undefined, "basic");
    expect(issues).toHaveLength(0);
  });
});
