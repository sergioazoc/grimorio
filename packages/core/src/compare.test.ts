import { describe, it, expect } from "vitest";
import { compareSpecs } from "./compare.js";
import type { ComponentSpec } from "./schemas/component-spec.js";

function makeSpec(overrides: Partial<ComponentSpec> = {}): ComponentSpec {
  return {
    name: "TestComponent",
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
    ...overrides,
  };
}

describe("compareSpecs", () => {
  it("returns inSync when specs are identical", () => {
    const spec = makeSpec({
      props: [{ name: "variant", type: "string", required: true }],
      variants: [{ name: "size", values: ["sm", "md"] }],
      tokenMapping: { "root.background": "{color.primary}" },
      slots: [{ name: "icon", required: false }],
    });

    const result = compareSpecs(spec, spec);
    expect(result.inSync).toBe(true);
    expect(result.totalDifferences).toBe(0);
    expect(result.differences).toEqual([]);
  });

  it("detects missing props in target", () => {
    const source = makeSpec({ props: [{ name: "disabled", type: "boolean", required: false }] });
    const target = makeSpec();

    const result = compareSpecs(source, target);
    expect(result.inSync).toBe(false);
    expect(result.summary.props.missing).toBe(1);
    expect(result.differences[0].type).toBe("missing");
    expect(result.differences[0].name).toBe("disabled");
  });

  it("detects extra props in target", () => {
    const source = makeSpec();
    const target = makeSpec({ props: [{ name: "extra", type: "string", required: false }] });

    const result = compareSpecs(source, target);
    expect(result.summary.props.extra).toBe(1);
    expect(result.differences[0].type).toBe("extra");
  });

  it("detects prop type change", () => {
    const source = makeSpec({ props: [{ name: "value", type: "string", required: false }] });
    const target = makeSpec({ props: [{ name: "value", type: "boolean", required: false }] });

    const result = compareSpecs(source, target);
    expect(result.summary.props.changed).toBe(1);
    expect(result.differences[0].source).toBe("string");
    expect(result.differences[0].target).toBe("boolean");
  });

  it("detects prop required change", () => {
    const source = makeSpec({ props: [{ name: "label", type: "string", required: true }] });
    const target = makeSpec({ props: [{ name: "label", type: "string", required: false }] });

    const result = compareSpecs(source, target);
    expect(result.summary.props.changed).toBe(1);
  });

  it("detects missing variants in target", () => {
    const source = makeSpec({ variants: [{ name: "size", values: ["sm", "md"] }] });
    const target = makeSpec();

    const result = compareSpecs(source, target);
    expect(result.summary.variants.missing).toBe(1);
  });

  it("detects extra variants in target", () => {
    const source = makeSpec();
    const target = makeSpec({ variants: [{ name: "color", values: ["red", "blue"] }] });

    const result = compareSpecs(source, target);
    expect(result.summary.variants.extra).toBe(1);
  });

  it("detects variant value differences", () => {
    const source = makeSpec({ variants: [{ name: "size", values: ["sm", "md", "lg"] }] });
    const target = makeSpec({ variants: [{ name: "size", values: ["sm", "md", "xl"] }] });

    const result = compareSpecs(source, target);
    expect(result.summary.variants.changed).toBe(1);
    expect(result.differences[0].message).toContain("lg");
    expect(result.differences[0].message).toContain("xl");
  });

  it("detects missing and extra token mappings", () => {
    const source = makeSpec({
      tokenMapping: { "root.background": "{color.primary}", "root.color": "{color.foreground}" },
    });
    const target = makeSpec({
      tokenMapping: { "root.background": "{color.primary}", "label.color": "{color.muted}" },
    });

    const result = compareSpecs(source, target);
    expect(result.summary.tokenMapping.missing).toBe(1);
    expect(result.summary.tokenMapping.extra).toBe(1);
  });

  it("detects changed token mapping values", () => {
    const source = makeSpec({
      tokenMapping: { "root.background": "{color.primary}" },
    });
    const target = makeSpec({
      tokenMapping: { "root.background": "{color.secondary}" },
    });

    const result = compareSpecs(source, target);
    expect(result.summary.tokenMapping.changed).toBe(1);
    expect(result.differences[0].source).toBe("{color.primary}");
    expect(result.differences[0].target).toBe("{color.secondary}");
  });

  it("detects missing and extra slots", () => {
    const source = makeSpec({ slots: [{ name: "icon", required: false }] });
    const target = makeSpec({ slots: [{ name: "footer", required: false }] });

    const result = compareSpecs(source, target);
    expect(result.summary.slots.missing).toBe(1);
    expect(result.summary.slots.extra).toBe(1);
  });

  it("detects missing and extra anatomy parts", () => {
    const source = makeSpec({
      anatomy: [
        { name: "root", required: true },
        { name: "label", required: true },
      ],
    });
    const target = makeSpec({
      anatomy: [
        { name: "root", required: true },
        { name: "icon", required: false },
      ],
    });

    const result = compareSpecs(source, target);
    expect(result.summary.anatomy.missing).toBe(1);
    expect(result.summary.anatomy.extra).toBe(1);
  });

  it("detects missing and extra states", () => {
    const source = makeSpec({ states: ["hover", "focus", "disabled"] });
    const target = makeSpec({ states: ["hover", "focus", "active"] });

    const result = compareSpecs(source, target);
    expect(result.summary.states.missing).toBe(1);
    expect(result.summary.states.extra).toBe(1);
  });

  it("detects missing and extra events", () => {
    const source = makeSpec({
      events: [{ name: "onClick" }, { name: "onFocus" }],
    });
    const target = makeSpec({
      events: [{ name: "onClick" }, { name: "onBlur" }],
    });

    const result = compareSpecs(source, target);
    expect(result.summary.events.missing).toBe(1);
    expect(result.summary.events.extra).toBe(1);
  });

  it("handles empty specs", () => {
    const result = compareSpecs(makeSpec(), makeSpec());
    expect(result.inSync).toBe(true);
    expect(result.totalDifferences).toBe(0);
  });

  it("counts total differences correctly", () => {
    const source = makeSpec({
      props: [
        { name: "a", type: "string", required: false },
        { name: "b", type: "boolean", required: false },
      ],
      tokenMapping: { "root.background": "{color.primary}" },
    });
    const target = makeSpec({
      props: [{ name: "a", type: "number", required: false }],
      slots: [{ name: "icon", required: false }],
    });

    const result = compareSpecs(source, target);
    // a: type changed, b: missing, root.background: missing tokenMapping, icon: extra slot
    expect(result.totalDifferences).toBe(4);
    expect(result.inSync).toBe(false);
  });

  it("uses target name for componentName", () => {
    const source = makeSpec({ name: "FigmaButton" });
    const target = makeSpec({ name: "Button" });

    const result = compareSpecs(source, target);
    expect(result.componentName).toBe("Button");
  });
});
