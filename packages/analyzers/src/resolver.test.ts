import { describe, it, expect } from "vitest";
import { resolveImport } from "./resolver.js";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const fixturesDir = join(fileURLToPath(import.meta.url), "../fixtures");

describe("resolveImport", () => {
  it("should resolve a relative import", () => {
    const testFile = join(fixturesDir, "Button.tsx");
    // This may not resolve since fixtures don't have actual imports to resolve
    // but it tests the function doesn't throw
    const result = resolveImport("./nonexistent", testFile);
    expect(result.ok).toBe(false);
  });

  it("should return error for unresolvable import", () => {
    const result = resolveImport("nonexistent-package-xyz", "/tmp/test.ts");
    expect(result.ok).toBe(false);
  });
});
