import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { createMcpServer } from "../server.js";

const FIXTURE_DIR = join(import.meta.dirname, "__test_fixtures_guide__");

describe("implementation-guide resource", () => {
  beforeAll(async () => {
    await mkdir(FIXTURE_DIR, { recursive: true });
    await writeFile(
      join(FIXTURE_DIR, "button.json"),
      JSON.stringify({
        name: "Button",
        description: "A button",
        category: "actions",
        complexity: "moderate",
        props: [{ name: "children", type: "ReactNode", required: true }],
        variants: [{ name: "variant", values: ["primary", "secondary"] }],
        defaultVariants: { variant: "primary" },
        slots: [],
        anatomy: [],
        tokenMapping: { "root.background": "{color.primary}" },
        states: [],
        events: [],
        dependencies: [],
        guidelines: [],
      }),
    );
  });

  afterAll(async () => {
    await rm(FIXTURE_DIR, { recursive: true, force: true });
  });

  it("should register on the server", () => {
    const server = createMcpServer({ specs: FIXTURE_DIR });
    expect(server).toBeDefined();
  });

  it("should register with tokens config", () => {
    const server = createMcpServer({
      specs: FIXTURE_DIR,
      tokens: "./nonexistent-tokens.json",
    });
    expect(server).toBeDefined();
  });
});
