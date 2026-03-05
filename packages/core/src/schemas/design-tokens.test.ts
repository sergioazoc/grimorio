import { describe, it, expect } from "vitest";
import { DesignTokenSchema } from "./design-tokens.js";

describe("DesignTokenSchema", () => {
  it("should validate a simple token", () => {
    const result = DesignTokenSchema.safeParse({
      $value: "#3b82f6",
      $type: "color",
    });
    expect(result.success).toBe(true);
  });

  it("should validate numeric token", () => {
    const result = DesignTokenSchema.safeParse({
      $value: 16,
      $type: "dimension",
    });
    expect(result.success).toBe(true);
  });

  it("should validate composite token", () => {
    const result = DesignTokenSchema.safeParse({
      $value: { fontFamily: "Inter", fontWeight: 400 },
      $type: "typography",
    });
    expect(result.success).toBe(true);
  });

  it("should validate token with extensions", () => {
    const result = DesignTokenSchema.safeParse({
      $value: "#000",
      $extensions: { "com.example.metadata": { usage: "text" } },
    });
    expect(result.success).toBe(true);
  });

  it("should validate deprecated token", () => {
    const result = DesignTokenSchema.safeParse({
      $value: "#ccc",
      $deprecated: "Use color.neutral instead",
    });
    expect(result.success).toBe(true);
  });
});
