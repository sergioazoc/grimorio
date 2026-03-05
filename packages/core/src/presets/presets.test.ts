import { describe, it, expect } from "vitest";
import { ComponentSpecSchema } from "../schemas/component-spec.js";
import { applyPreset, listPresetIds, getBuiltinPresets } from "./registry.js";

describe("listPresetIds", () => {
  it("should return all preset IDs", () => {
    const ids = listPresetIds();
    expect(ids).toContain("button");
    expect(ids).toContain("input");
    expect(ids).toContain("select");
    expect(ids).toContain("checkbox");
    expect(ids).toContain("dialog");
    expect(ids).toContain("card");
    expect(ids).toContain("avatar");
    expect(ids).toContain("badge");
    expect(ids).toContain("tabs");
    expect(ids).toContain("textarea");
    expect(ids.length).toBe(10);
  });
});

describe("getBuiltinPresets", () => {
  it("should return a copy of presets", () => {
    const presets = getBuiltinPresets();
    expect(Object.keys(presets).length).toBe(10);
    // Verify it's a copy
    presets["custom"] = {} as any;
    expect(Object.keys(getBuiltinPresets()).length).toBe(10);
  });
});

describe("applyPreset", () => {
  it("should apply a known preset with name injected", () => {
    const spec = applyPreset("button", "MyButton");
    expect(spec.name).toBe("MyButton");
    expect(spec.props.length).toBeGreaterThan(0);
    expect(spec.variants.length).toBeGreaterThan(0);
    expect(spec.accessibility).toBeDefined();
    expect(spec.accessibility?.role).toBe("button");
  });

  it("should be case-insensitive for preset IDs", () => {
    const spec = applyPreset("Button", "PrimaryButton");
    expect(spec.name).toBe("PrimaryButton");
    expect(spec.props.length).toBeGreaterThan(0);
  });

  it("should return improved skeleton for unknown preset", () => {
    const spec = applyPreset("CustomWidget", "CustomWidget");
    expect(spec.name).toBe("CustomWidget");
    expect(spec.description).toBe("CustomWidget component");
    expect(spec.props).toEqual([]);
    expect(spec.accessibility).toBeDefined();
    expect(spec.accessibility?.ariaAttributes).toEqual([]);
    expect(spec.accessibility?.keyboardInteractions).toEqual([]);
  });

  it("should apply overrides on top of preset", () => {
    const spec = applyPreset("button", "Button", {
      description: "Custom button description",
      category: "custom-actions",
    });
    expect(spec.description).toBe("Custom button description");
    expect(spec.category).toBe("custom-actions");
    // Preset props should still be present
    expect(spec.props.length).toBeGreaterThan(0);
  });

  it("should apply overrides on top of skeleton", () => {
    const spec = applyPreset("unknown", "MyWidget", {
      description: "A custom widget",
      category: "widgets",
    });
    expect(spec.description).toBe("A custom widget");
    expect(spec.category).toBe("widgets");
  });

  describe("every preset validates against ComponentSpecSchema", () => {
    const ids = listPresetIds();
    for (const id of ids) {
      it(`preset "${id}" produces a valid ComponentSpec`, () => {
        const spec = applyPreset(id, `Test${id}`);
        const result = ComponentSpecSchema.safeParse(spec);
        expect(result.success).toBe(true);
      });
    }
  });

  it("skeleton also validates against ComponentSpecSchema", () => {
    const spec = applyPreset("nonexistent", "Unknown");
    const result = ComponentSpecSchema.safeParse(spec);
    expect(result.success).toBe(true);
  });
});
