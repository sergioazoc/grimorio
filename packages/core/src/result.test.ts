import { describe, it, expect } from "vitest";
import { ok, err, type Result } from "./result.js";

describe("Result", () => {
  it("should create ok result", () => {
    const result = ok(42);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(42);
    }
  });

  it("should create err result", () => {
    const result = err("something failed");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("something failed");
    }
  });

  it("should narrow types correctly", () => {
    const result: Result<number, string> = ok(10);
    if (result.ok) {
      const _value: number = result.value;
      expect(_value).toBe(10);
    }
  });
});
