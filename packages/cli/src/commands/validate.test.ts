import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { rm, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const TEST_DIR = join(import.meta.dirname, "__test_validate__");

const BUTTON_SPEC = {
  name: "Button",
  complexity: "simple",
  props: [
    { name: "variant", type: "string", required: false },
    { name: "children", type: "ReactNode", required: true },
  ],
  variants: [],
  defaultVariants: {},
  slots: [],
  anatomy: [],
  tokenMapping: {},
  states: [],
  events: [],
  accessibility: {
    role: "button",
    ariaAttributes: ["aria-disabled"],
    keyboardInteractions: [],
  },
  guidelines: [],
};

const BUTTON_COMPONENT = `
import React from 'react';

interface ButtonProps {
  variant?: string;
  children: React.ReactNode;
}

export function Button({ variant, children }: ButtonProps) {
  return (
    <button className="btn" role="button" aria-disabled={false}>
      {children}
    </button>
  );
}
`;

const BUTTON_MISSING_PROP = `
export function Button() {
  return <button>Click</button>;
}
`;

describe("validate command", () => {
  const originalCwd = process.cwd();

  beforeEach(async () => {
    if (existsSync(TEST_DIR)) {
      await rm(TEST_DIR, { recursive: true });
    }
    await mkdir(join(TEST_DIR, "specs"), { recursive: true });
    await mkdir(join(TEST_DIR, "src", "components"), { recursive: true });
    process.chdir(TEST_DIR);
  });

  afterEach(async () => {
    process.chdir(originalCwd);
    if (existsSync(TEST_DIR)) {
      await rm(TEST_DIR, { recursive: true });
    }
  });

  it("should pass validation for a matching component", async () => {
    await writeFile(join(TEST_DIR, "specs", "button.json"), JSON.stringify(BUTTON_SPEC, null, 2));
    await writeFile(join(TEST_DIR, "src", "components", "Button.tsx"), BUTTON_COMPONENT);

    const { loadAllSpecs } = await import("grimorio-core");
    const { analyzeReactFile } = await import("grimorio-analyzers");
    const { validate } = await import("grimorio-validators");
    const { readFile } = await import("node:fs/promises");

    const specsResult = await loadAllSpecs(join(TEST_DIR, "specs"));
    expect(specsResult.ok).toBe(true);
    if (!specsResult.ok) return;

    const source = await readFile(join(TEST_DIR, "src", "components", "Button.tsx"), "utf-8");
    const analysis = analyzeReactFile("Button.tsx", source);
    const spec = specsResult.value.find(
      (s) => s.name.toLowerCase() === analysis.name.toLowerCase(),
    );
    expect(spec).toBeDefined();

    const result = validate(analysis, spec!, undefined, "basic");
    expect(result.valid).toBe(true);
  });

  it("should detect missing required props at basic level", async () => {
    await writeFile(join(TEST_DIR, "specs", "button.json"), JSON.stringify(BUTTON_SPEC, null, 2));
    await writeFile(join(TEST_DIR, "src", "components", "Button.tsx"), BUTTON_MISSING_PROP);

    const { loadAllSpecs } = await import("grimorio-core");
    const { analyzeReactFile } = await import("grimorio-analyzers");
    const { validate } = await import("grimorio-validators");
    const { readFile } = await import("node:fs/promises");

    const specsResult = await loadAllSpecs(join(TEST_DIR, "specs"));
    expect(specsResult.ok).toBe(true);
    if (!specsResult.ok) return;

    const source = await readFile(join(TEST_DIR, "src", "components", "Button.tsx"), "utf-8");
    const analysis = analyzeReactFile("Button.tsx", source);
    const spec = specsResult.value.find((s) => s.name === "Button");

    const result = validate(analysis, spec!, undefined, "basic");
    expect(result.valid).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
    expect(result.issues.some((i) => i.code === "MISSING_PROP")).toBe(true);
  });

  it("should validate at strict level with more checks", async () => {
    const strictSpec = {
      ...BUTTON_SPEC,
      props: [...BUTTON_SPEC.props, { name: "size", type: "string", required: false }],
      accessibility: {
        ...BUTTON_SPEC.accessibility,
        keyboardInteractions: [
          { key: "Enter", description: "Activate button" },
          { key: "Space", description: "Activate button" },
        ],
      },
    };

    await writeFile(join(TEST_DIR, "specs", "button.json"), JSON.stringify(strictSpec, null, 2));
    await writeFile(join(TEST_DIR, "src", "components", "Button.tsx"), BUTTON_COMPONENT);

    const { loadAllSpecs } = await import("grimorio-core");
    const { analyzeReactFile } = await import("grimorio-analyzers");
    const { validate } = await import("grimorio-validators");
    const { readFile } = await import("node:fs/promises");

    const specsResult = await loadAllSpecs(join(TEST_DIR, "specs"));
    expect(specsResult.ok).toBe(true);
    if (!specsResult.ok) return;

    const source = await readFile(join(TEST_DIR, "src", "components", "Button.tsx"), "utf-8");
    const analysis = analyzeReactFile("Button.tsx", source);
    const spec = specsResult.value.find((s) => s.name === "Button");

    const result = validate(analysis, spec!, undefined, "strict");
    // Strict should report more issues
    expect(result.issues.length).toBeGreaterThan(0);
  });
});
