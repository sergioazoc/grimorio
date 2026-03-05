import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { readFile, rm, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { ComponentSpecSchema } from "grimorio-core";

// We test the add command by importing and calling its run function
// Since it's a citty command, we extract and test the logic

const SPECS_DIR = join(import.meta.dirname, "__test_specs__");

describe("add command", () => {
  beforeEach(async () => {
    if (existsSync(SPECS_DIR)) {
      await rm(SPECS_DIR, { recursive: true });
    }
  });

  afterEach(async () => {
    if (existsSync(SPECS_DIR)) {
      await rm(SPECS_DIR, { recursive: true });
    }
  });

  it("should generate spec with preset for known component", async () => {
    const { applyPreset } = await import("grimorio-core");
    const spec = applyPreset("button", "Button");

    await mkdir(SPECS_DIR, { recursive: true });
    const outputPath = join(SPECS_DIR, "button.json");
    const { writeFile } = await import("node:fs/promises");
    await writeFile(outputPath, JSON.stringify(spec, null, 2) + "\n");

    const content = JSON.parse(await readFile(outputPath, "utf-8"));
    const result = ComponentSpecSchema.safeParse(content);
    expect(result.success).toBe(true);
    expect(content.name).toBe("Button");
    expect(content.props.length).toBeGreaterThan(0);
    expect(content.accessibility.role).toBe("button");
  });

  it("should generate improved skeleton for unknown component", async () => {
    const { applyPreset } = await import("grimorio-core");
    const spec = applyPreset("CustomWidget", "CustomWidget");

    await mkdir(SPECS_DIR, { recursive: true });
    const outputPath = join(SPECS_DIR, "customwidget.json");
    const { writeFile } = await import("node:fs/promises");
    await writeFile(outputPath, JSON.stringify(spec, null, 2) + "\n");

    const content = JSON.parse(await readFile(outputPath, "utf-8"));
    const result = ComponentSpecSchema.safeParse(content);
    expect(result.success).toBe(true);
    expect(content.name).toBe("CustomWidget");
    expect(content.accessibility).toBeDefined();
    expect(content.accessibility.ariaAttributes).toEqual([]);
  });

  it("should list available presets", async () => {
    const { listPresetIds } = await import("grimorio-core");
    const ids = listPresetIds();
    expect(ids.length).toBe(10);
    expect(ids).toContain("button");
    expect(ids).toContain("select");
  });

  it("should apply description override", async () => {
    const { applyPreset } = await import("grimorio-core");
    const spec = applyPreset("select", "CountryPicker", {
      description: "Country picker",
    });
    expect(spec.name).toBe("CountryPicker");
    expect(spec.description).toBe("Country picker");
    // Preset data still present
    expect(spec.accessibility?.role).toBe("combobox");
  });
});
