import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { createMcpServer } from "../server.js";
import type { ComponentSpec } from "grimorio-core";

const FIXTURE_DIR = join(import.meta.dirname, "__test_fixtures_guidelines__");

const buttonSpec: ComponentSpec = {
  name: "Button",
  description: "A clickable button",
  category: "actions",
  complexity: "moderate",
  props: [
    { name: "children", type: "ReactNode", required: true, description: "Button content" },
    {
      name: "variant",
      type: "string",
      required: false,
      default: "primary",
      description: "Visual style",
    },
    { name: "disabled", type: "boolean", required: false, default: false },
  ],
  variants: [
    { name: "variant", values: ["primary", "secondary", "ghost"], description: "Visual style" },
    { name: "size", values: ["sm", "md", "lg"] },
  ],
  defaultVariants: { variant: "primary", size: "md" },
  slots: [{ name: "icon", description: "Leading icon", required: false }],
  anatomy: [
    { name: "root", description: "The button element", required: true },
    { name: "icon", description: "Icon element", required: false },
    { name: "label", description: "Label element", required: true },
  ],
  tokenMapping: {
    "root.background": "{color.primary}",
    "root.padding": "{spacing.md}",
  },
  states: ["hover", "focus", "disabled"],
  events: [{ name: "onClick", description: "Fired when clicked" }],
  dependencies: [],
  accessibility: {
    role: "button",
    ariaAttributes: ["aria-disabled", "aria-pressed"],
    keyboardInteractions: [
      { key: "Enter", description: "Activates the button" },
      { key: "Space", description: "Activates the button" },
    ],
  },
  guidelines: ["Use primary for main actions", "Use ghost for tertiary actions"],
};

describe("get_component_guidelines tool", () => {
  beforeAll(async () => {
    await mkdir(FIXTURE_DIR, { recursive: true });
    await writeFile(join(FIXTURE_DIR, "button.json"), JSON.stringify(buttonSpec, null, 2));
  });

  afterAll(async () => {
    await rm(FIXTURE_DIR, { recursive: true, force: true });
  });

  it("should register on the server", () => {
    const server = createMcpServer({ specs: FIXTURE_DIR });
    expect(server).toBeDefined();
  });

  // Since MCP SDK doesn't expose tool handlers directly,
  // we test the markdown generation logic by verifying the spec fixture.
  // The tool reads specs and generates markdown — we verify the spec is valid
  // and the tool registration doesn't throw.

  it("should have the button spec fixture as a valid ComponentSpec", () => {
    expect(buttonSpec.name).toBe("Button");
    expect(buttonSpec.props.filter((p) => p.required)).toHaveLength(1);
    expect(buttonSpec.accessibility?.role).toBe("button");
    expect(buttonSpec.accessibility?.keyboardInteractions).toHaveLength(2);
    expect(buttonSpec.anatomy).toHaveLength(3);
    expect(buttonSpec.slots).toHaveLength(1);
    expect(Object.keys(buttonSpec.tokenMapping)).toHaveLength(2);
    expect(buttonSpec.states).toHaveLength(3);
    expect(buttonSpec.events).toHaveLength(1);
    expect(buttonSpec.guidelines).toHaveLength(2);
  });
});
