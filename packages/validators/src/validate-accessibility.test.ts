import { describe, it, expect } from "vitest";
import { validateAccessibility } from "./validate-accessibility.js";
import type { ComponentSpec } from "grimorio-core";
import type { AnalyzedComponent } from "grimorio-analyzers";

const makeSpec = (overrides: Partial<ComponentSpec> = {}): ComponentSpec => ({
  name: "Button",
  complexity: "moderate",
  props: [],
  variants: [],
  defaultVariants: {},
  slots: [],
  anatomy: [],
  tokenMapping: {},
  states: [],
  events: [],
  dependencies: [],
  guidelines: [],
  accessibility: {
    role: "button",
    ariaAttributes: ["aria-disabled"],
    keyboardInteractions: [{ key: "Enter", description: "Activates the button" }],
  },
  ...overrides,
});

const makeAnalysis = (overrides: Partial<AnalyzedComponent> = {}): AnalyzedComponent => ({
  name: "Button",
  filePath: "Button.tsx",
  framework: "react",
  props: [],
  variants: [],
  tailwindClasses: [],
  accessibilityAttrs: [
    { name: "role", value: "button" },
    { name: "aria-disabled" },
    { name: "onKeyDown" },
  ],
  imports: [],
  exports: [],
  ...overrides,
});

describe("validateAccessibility", () => {
  it("should pass with correct role and aria", () => {
    const issues = validateAccessibility(makeAnalysis(), makeSpec());
    const errors = issues.filter((i) => i.severity === "error");
    expect(errors).toHaveLength(0);
  });

  it("should detect missing role", () => {
    const analysis = makeAnalysis({
      accessibilityAttrs: [{ name: "aria-disabled" }, { name: "onKeyDown" }],
    });
    const issues = validateAccessibility(analysis, makeSpec());
    const missing = issues.find((i) => i.code === "MISSING_ROLE");
    expect(missing).toBeDefined();
  });

  it("should detect missing keyboard handler", () => {
    const analysis = makeAnalysis({
      accessibilityAttrs: [{ name: "role", value: "button" }, { name: "aria-disabled" }],
    });
    const issues = validateAccessibility(analysis, makeSpec(), "standard");
    const missing = issues.find((i) => i.code === "MISSING_KEYBOARD_HANDLER");
    expect(missing).toBeDefined();
  });

  it("should return no issues when no a11y spec", () => {
    const spec = makeSpec({ accessibility: undefined });
    const issues = validateAccessibility(makeAnalysis(), spec);
    expect(issues).toHaveLength(0);
  });
});
