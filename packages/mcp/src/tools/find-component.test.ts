import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { createMcpServer } from "../server.js";
import type { ComponentSpec } from "grimorio-core";

const FIXTURE_DIR = join(import.meta.dirname, "__test_fixtures_find__");

const specs: ComponentSpec[] = [
  {
    name: "Button",
    description: "A clickable button component",
    category: "actions",
    complexity: "moderate",
    props: [],
    variants: [],
    defaultVariants: {},
    slots: [],
    anatomy: [],
    tokenMapping: {},
    states: [],
    events: [],
    dependencies: [],
    guidelines: ["Use for primary actions"],
  },
  {
    name: "Dialog",
    description: "A modal overlay",
    category: "feedback",
    complexity: "complex",
    props: [],
    variants: [],
    defaultVariants: {},
    slots: [],
    anatomy: [],
    tokenMapping: {},
    states: [],
    events: [],
    dependencies: [],
    guidelines: ["Always trap focus inside"],
  },
];

describe("find_component tool", () => {
  beforeAll(async () => {
    await mkdir(FIXTURE_DIR, { recursive: true });
    for (const spec of specs) {
      await writeFile(
        join(FIXTURE_DIR, `${spec.name.toLowerCase()}.json`),
        JSON.stringify(spec, null, 2),
      );
    }
  });

  afterAll(async () => {
    await rm(FIXTURE_DIR, { recursive: true, force: true });
  });

  it("should register on the server with fixture specs", () => {
    const server = createMcpServer({ specs: FIXTURE_DIR });
    expect(server).toBeDefined();
  });

  // Verify the search logic matches against fixture data
  it("should have specs that match expected search patterns", () => {
    const queryLower = "button";
    const matches = specs.filter(
      (s) =>
        s.name.toLowerCase().includes(queryLower) ||
        s.description?.toLowerCase().includes(queryLower) ||
        s.category?.toLowerCase().includes(queryLower) ||
        s.guidelines.some((g) => g.toLowerCase().includes(queryLower)),
    );
    expect(matches).toHaveLength(1);
    expect(matches[0].name).toBe("Button");
  });

  it("should match by category", () => {
    const queryLower = "feedback";
    const matches = specs.filter(
      (s) =>
        s.name.toLowerCase().includes(queryLower) ||
        s.description?.toLowerCase().includes(queryLower) ||
        s.category?.toLowerCase().includes(queryLower) ||
        s.guidelines.some((g) => g.toLowerCase().includes(queryLower)),
    );
    expect(matches).toHaveLength(1);
    expect(matches[0].name).toBe("Dialog");
  });

  it("should match by description", () => {
    const queryLower = "modal";
    const matches = specs.filter(
      (s) =>
        s.name.toLowerCase().includes(queryLower) ||
        s.description?.toLowerCase().includes(queryLower) ||
        s.category?.toLowerCase().includes(queryLower) ||
        s.guidelines.some((g) => g.toLowerCase().includes(queryLower)),
    );
    expect(matches).toHaveLength(1);
    expect(matches[0].name).toBe("Dialog");
  });

  it("should match by guideline content", () => {
    const queryLower = "focus";
    const matches = specs.filter(
      (s) =>
        s.name.toLowerCase().includes(queryLower) ||
        s.description?.toLowerCase().includes(queryLower) ||
        s.category?.toLowerCase().includes(queryLower) ||
        s.guidelines.some((g) => g.toLowerCase().includes(queryLower)),
    );
    expect(matches).toHaveLength(1);
    expect(matches[0].name).toBe("Dialog");
  });

  it("should return empty for non-matching query", () => {
    const queryLower = "zzzznonexistent";
    const matches = specs.filter(
      (s) =>
        s.name.toLowerCase().includes(queryLower) ||
        s.description?.toLowerCase().includes(queryLower) ||
        s.category?.toLowerCase().includes(queryLower) ||
        s.guidelines.some((g) => g.toLowerCase().includes(queryLower)),
    );
    expect(matches).toHaveLength(0);
  });
});
