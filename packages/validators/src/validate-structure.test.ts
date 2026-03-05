import { describe, it, expect } from "vitest";
import { validateStructure } from "./validate-structure.js";
import type { ComponentSpec } from "grimorio-core";
import type { AnalyzedComponent } from "grimorio-analyzers";

const makeSpec = (overrides: Partial<ComponentSpec> = {}): ComponentSpec => ({
  name: "Button",
  complexity: "moderate",
  props: [
    { name: "variant", type: "string", required: false },
    { name: "children", type: "ReactNode", required: true },
  ],
  variants: [{ name: "variant", values: ["primary", "secondary"] }],
  defaultVariants: {},
  slots: [],
  anatomy: [],
  tokenMapping: {},
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
  props: [
    { name: "variant", type: "string", required: false },
    { name: "children", type: "ReactNode", required: true },
  ],
  variants: [{ name: "variant", values: ["primary", "secondary"] }],
  tailwindClasses: [],
  accessibilityAttrs: [],
  imports: [],
  exports: [],
  ...overrides,
});

describe("validateStructure", () => {
  it("should pass with perfect match", () => {
    const issues = validateStructure(makeAnalysis(), makeSpec());
    const errors = issues.filter((i) => i.severity === "error");
    expect(errors).toHaveLength(0);
  });

  it("should detect missing required prop", () => {
    const analysis = makeAnalysis({
      props: [{ name: "variant", type: "string", required: false }],
    });
    const issues = validateStructure(analysis, makeSpec());
    const missing = issues.find((i) => i.code === "MISSING_PROP");
    expect(missing).toBeDefined();
    expect(missing?.expected).toBe("children");
  });

  it("should detect extra prop in strict mode", () => {
    const analysis = makeAnalysis({
      props: [
        { name: "variant", type: "string", required: false },
        { name: "children", type: "ReactNode", required: true },
        { name: "extraProp", type: "string", required: false },
      ],
    });
    const issues = validateStructure(analysis, makeSpec(), "strict");
    const extra = issues.find((i) => i.code === "EXTRA_PROP");
    expect(extra).toBeDefined();
    expect(extra?.actual).toBe("extraProp");
  });

  it("should detect missing variant", () => {
    const analysis = makeAnalysis({ variants: [] });
    const issues = validateStructure(analysis, makeSpec(), "standard");
    const missing = issues.find((i) => i.code === "MISSING_VARIANT");
    expect(missing).toBeDefined();
  });
});
