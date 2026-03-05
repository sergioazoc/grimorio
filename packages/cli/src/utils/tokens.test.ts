import { describe, it, expect } from "vitest";
import { resolveTokensPaths } from "./tokens.js";

describe("resolveTokensPaths", () => {
  it("should return default path when tokens is undefined", () => {
    const result = resolveTokensPaths({});
    expect(result.size).toBe(1);
    expect(result.get("default")).toBe("./tokens.json");
  });

  it("should wrap string tokens in a default map", () => {
    const result = resolveTokensPaths({ tokens: "./my-tokens.json" });
    expect(result.size).toBe(1);
    expect(result.get("default")).toBe("./my-tokens.json");
  });

  it("should convert record tokens to map", () => {
    const result = resolveTokensPaths({
      tokens: {
        default: "./tokens.json",
        dark: "./tokens-dark.json",
        brand: "./tokens-brand.json",
      },
    });
    expect(result.size).toBe(3);
    expect(result.get("default")).toBe("./tokens.json");
    expect(result.get("dark")).toBe("./tokens-dark.json");
    expect(result.get("brand")).toBe("./tokens-brand.json");
  });
});
