import { describe, it, expect } from "vitest";
import { validate } from "./validate.js";
import type { ComponentSpec } from "grimorio-core";
import type { AnalyzedComponent } from "grimorio-analyzers";

describe("validate", () => {
  const spec: ComponentSpec = {
    name: "Button",
    complexity: "moderate",
    props: [{ name: "children", type: "ReactNode", required: true }],
    variants: [{ name: "variant", values: ["primary", "secondary"] }],
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
      keyboardInteractions: [{ key: "Enter", description: "Activate" }],
    },
  };

  const analysis: AnalyzedComponent = {
    name: "Button",
    filePath: "Button.tsx",
    framework: "react",
    props: [{ name: "children", type: "ReactNode", required: true }],
    variants: [{ name: "variant", values: ["primary", "secondary"] }],
    tailwindClasses: ["bg-blue-500"],
    accessibilityAttrs: [
      { name: "role", value: "button" },
      { name: "aria-disabled" },
      { name: "onKeyDown" },
    ],
    imports: [],
    exports: [],
  };

  it("should validate with all three validators", () => {
    const result = validate(analysis, spec);
    expect(result.componentName).toBe("Button");
    expect(result.level).toBe("standard");
    expect(result.valid).toBe(true);
  });

  it("should return issues when problems found", () => {
    const badAnalysis: AnalyzedComponent = {
      ...analysis,
      props: [],
      accessibilityAttrs: [],
    };
    const result = validate(badAnalysis, spec);
    expect(result.valid).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
  });
});
