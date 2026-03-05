import { describe, it, expect } from "vitest";
import { ComponentSpecSchema } from "./component-spec.js";

describe("ComponentSpecSchema", () => {
  it("should validate a valid spec", () => {
    const result = ComponentSpecSchema.safeParse({
      name: "Button",
      props: [{ name: "variant", type: "string" }],
    });
    expect(result.success).toBe(true);
  });

  it("should fail without name", () => {
    const result = ComponentSpecSchema.safeParse({
      description: "No name",
    });
    expect(result.success).toBe(false);
  });

  it("should apply defaults", () => {
    const result = ComponentSpecSchema.parse({ name: "Button" });
    expect(result.complexity).toBe("moderate");
    expect(result.props).toEqual([]);
    expect(result.variants).toEqual([]);
    expect(result.slots).toEqual([]);
    expect(result.tokenMapping).toEqual({});
    expect(result.anatomy).toEqual([]);
    expect(result.states).toEqual([]);
    expect(result.events).toEqual([]);
    expect(result.guidelines).toEqual([]);
  });
});
