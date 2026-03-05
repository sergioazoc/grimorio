import { describe, it, expect } from "vitest";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadSpec, loadAllSpecs, validateSpec } from "./spec-loader.js";

const fixturesDir = join(fileURLToPath(import.meta.url), "../../fixtures");

describe("loadSpec", () => {
  it("should load a valid spec", async () => {
    const result = await loadSpec(join(fixturesDir, "button-spec.json"));
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe("Button");
      expect(result.value.props).toHaveLength(4);
    }
  });

  it("should return error for invalid spec", async () => {
    const result = await loadSpec(join(fixturesDir, "invalid-spec.json"));
    expect(result.ok).toBe(false);
  });

  it("should return error for non-existent file", async () => {
    const result = await loadSpec("/nonexistent/file.json");
    expect(result.ok).toBe(false);
  });
});

describe("loadAllSpecs", () => {
  it("should fail when directory contains invalid specs", async () => {
    const result = await loadAllSpecs(fixturesDir);
    // loadAllSpecs will fail on first invalid spec (invalid-spec.json)
    expect(result.ok).toBe(false);
  });
});

describe("validateSpec", () => {
  it("should validate valid data", () => {
    const result = validateSpec({ name: "Test" });
    expect(result.ok).toBe(true);
  });

  it("should reject invalid data", () => {
    const result = validateSpec({ description: "no name" });
    expect(result.ok).toBe(false);
  });
});
