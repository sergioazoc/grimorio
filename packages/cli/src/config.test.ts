import { describe, it, expect, vi } from "vitest";
import { defineConfig, resolveConfig } from "./config.js";

describe("defineConfig", () => {
  it("should return the config as-is", () => {
    const config = defineConfig({ specs: "./custom/**/*.json" });
    expect(config.specs).toBe("./custom/**/*.json");
  });
});

describe("resolveConfig", () => {
  it("should return defaults when no config file exists", async () => {
    const config = await resolveConfig();
    expect(config.specs).toBeDefined();
    expect(config.tokens).toBeDefined();
    expect(config.components).toBeDefined();
    expect(config.validation?.level).toBe("standard");
  });

  it("should merge overrides", async () => {
    const config = await resolveConfig({ validation: { level: "strict" } });
    expect(config.validation?.level).toBe("strict");
  });

  it("should strip unknown fields silently", async () => {
    const config = await resolveConfig({
      specs: "./specs/**/*.json",
      unknownField: "should be removed",
    } as Record<string, unknown>);
    expect(config.specs).toBe("./specs/**/*.json");
    expect((config as Record<string, unknown>).unknownField).toBeUndefined();
  });

  it("should return defaults and warn on invalid value", async () => {
    const consola = await import("consola");
    const warnSpy = vi.spyOn(consola.default, "warn");
    const config = await resolveConfig({
      validation: { level: "invalid-level" },
    } as Record<string, unknown>);
    // Should fall back to defaults
    expect(config.validation?.level).toBe("standard");
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it("should accept tokens as Record<string, string> for multi-theme", async () => {
    const config = await resolveConfig({
      tokens: { default: "./tokens.json", dark: "./tokens-dark.json" },
    });
    expect(config.tokens).toEqual({
      default: "./tokens.json",
      dark: "./tokens-dark.json",
    });
  });
});
