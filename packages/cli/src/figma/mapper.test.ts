import { describe, it, expect } from "vitest";
import { ComponentSpecSchema } from "grimorio-core";
import { mapFigmaToSpec, findComponentNode } from "./mapper.js";
import type { FigmaNode } from "./client.js";

function makeNode(overrides: Partial<FigmaNode> = {}): FigmaNode {
  return {
    id: "0:1",
    name: "TestComponent",
    type: "COMPONENT",
    ...overrides,
  };
}

describe("mapFigmaToSpec", () => {
  it("should map an empty component node to a valid spec", () => {
    const node = makeNode();
    const spec = mapFigmaToSpec("Button", node);

    expect(spec.name).toBe("Button");
    expect(spec.accessibility).toBeDefined();
    expect(spec.accessibility?.ariaAttributes).toEqual([]);

    const result = ComponentSpecSchema.safeParse(spec);
    expect(result.success).toBe(true);
  });

  it("should map VARIANT properties to variants and props", () => {
    const node = makeNode({
      componentPropertyDefinitions: {
        Size: {
          type: "VARIANT",
          defaultValue: "md",
          variantOptions: ["sm", "md", "lg"],
        },
      },
    });

    const spec = mapFigmaToSpec("Button", node);

    expect(spec.variants).toHaveLength(1);
    expect(spec.variants[0].name).toBe("size");
    expect(spec.variants[0].values).toEqual(["sm", "md", "lg"]);
    expect(spec.defaultVariants).toEqual({ size: "md" });
    expect(spec.props.find((p) => p.name === "size")).toBeDefined();
  });

  it("should map BOOLEAN properties to boolean props", () => {
    const node = makeNode({
      componentPropertyDefinitions: {
        Disabled: {
          type: "BOOLEAN",
          defaultValue: false,
        },
      },
    });

    const spec = mapFigmaToSpec("Button", node);

    const prop = spec.props.find((p) => p.name === "disabled");
    if (!prop) return expect(prop).toBeDefined();
    expect(prop.type).toBe("boolean");
    expect(prop.default).toBe(false);
  });

  it("should map TEXT properties to string props", () => {
    const node = makeNode({
      componentPropertyDefinitions: {
        Label: {
          type: "TEXT",
          defaultValue: "Click me",
        },
      },
    });

    const spec = mapFigmaToSpec("Button", node);

    const prop = spec.props.find((p) => p.name === "label");
    if (!prop) return expect(prop).toBeDefined();
    expect(prop.type).toBe("string");
    expect(prop.default).toBe("Click me");
  });

  it("should map INSTANCE_SWAP properties to slots", () => {
    const node = makeNode({
      componentPropertyDefinitions: {
        Icon: {
          type: "INSTANCE_SWAP",
          defaultValue: "",
        },
      },
    });

    const spec = mapFigmaToSpec("Card", node);

    expect(spec.slots).toHaveLength(1);
    expect(spec.slots[0].name).toBe("icon");
  });

  it("should clean property names with Figma suffixes", () => {
    const node = makeNode({
      componentPropertyDefinitions: {
        "Has Icon#1234:5": {
          type: "BOOLEAN",
          defaultValue: true,
        },
      },
    });

    const spec = mapFigmaToSpec("Button", node);

    const prop = spec.props.find((p) => p.name === "hasIcon");
    expect(prop).toBeDefined();
  });

  it("should determine complexity based on props+variants count", () => {
    // Simple (<=3)
    const simple = mapFigmaToSpec("Badge", makeNode());
    expect(simple.complexity).toBe("simple");

    // Moderate (4-8)
    const node = makeNode({
      componentPropertyDefinitions: {
        A: { type: "BOOLEAN", defaultValue: false },
        B: { type: "BOOLEAN", defaultValue: false },
        C: { type: "BOOLEAN", defaultValue: false },
        D: { type: "BOOLEAN", defaultValue: false },
      },
    });
    const moderate = mapFigmaToSpec("Widget", node);
    expect(moderate.complexity).toBe("moderate");
  });

  it("should guess category from component name", () => {
    expect(mapFigmaToSpec("Button", makeNode()).category).toBe("actions");
    expect(mapFigmaToSpec("InputField", makeNode()).category).toBe("forms");
    expect(mapFigmaToSpec("Dialog", makeNode()).category).toBe("feedback");
    expect(mapFigmaToSpec("NavBar", makeNode()).category).toBe("navigation");
    expect(mapFigmaToSpec("Card", makeNode()).category).toBe("data-display");
    expect(mapFigmaToSpec("Grid", makeNode()).category).toBe("layout");
    expect(mapFigmaToSpec("FooBar", makeNode()).category).toBe("uncategorized");
  });

  it("should extract token mappings from bound variables", () => {
    const node = makeNode({
      boundVariables: {
        fills: { type: "VARIABLE_ALIAS", id: "var1" },
      },
    });

    const variables = {
      var1: {
        id: "var1",
        name: "color/primary",
        resolvedType: "COLOR" as const,
        valuesByMode: {},
      },
    };

    const spec = mapFigmaToSpec("Button", node, { variables });
    expect(Object.values(spec.tokenMapping)).toContain("{color.primary}");
  });

  it("should map child node tokens with part name", () => {
    const child: FigmaNode = {
      id: "0:2",
      name: "Label",
      type: "TEXT",
      boundVariables: {
        fills: { type: "VARIABLE_ALIAS", id: "var1" },
      },
    };
    const node = makeNode({
      boundVariables: {
        fills: { type: "VARIABLE_ALIAS", id: "var1" },
      },
      children: [child],
    });

    const variables = {
      var1: {
        id: "var1",
        name: "color/primary",
        resolvedType: "COLOR" as const,
        valuesByMode: {},
      },
    };

    const spec = mapFigmaToSpec("Button", node, { variables });
    // Root node token
    expect(spec.tokenMapping["testComponent.background"]).toBe("{color.primary}");
    // Child node token with its own part name
    expect(spec.tokenMapping["label.background"]).toBe("{color.primary}");
  });

  it("should always produce a valid ComponentSpec", () => {
    const node = makeNode({
      componentPropertyDefinitions: {
        Size: { type: "VARIANT", defaultValue: "md", variantOptions: ["sm", "md", "lg"] },
        Disabled: { type: "BOOLEAN", defaultValue: false },
        Label: { type: "TEXT", defaultValue: "Hello" },
        "Leading Icon": { type: "INSTANCE_SWAP", defaultValue: "" },
      },
    });

    const spec = mapFigmaToSpec("ComplexButton", node);
    const result = ComponentSpecSchema.safeParse(spec);
    expect(result.success).toBe(true);
  });
});

describe("findComponentNode", () => {
  it("should find a component by name (case-insensitive)", () => {
    const tree: FigmaNode = {
      id: "0:0",
      name: "Page",
      type: "CANVAS",
      children: [
        { id: "0:1", name: "Button", type: "COMPONENT" },
        { id: "0:2", name: "Input", type: "COMPONENT" },
      ],
    };

    const found = findComponentNode(tree, "button");
    if (!found) return expect(found).toBeDefined();
    expect(found.name).toBe("Button");
  });

  it("should find a component set", () => {
    const tree: FigmaNode = {
      id: "0:0",
      name: "Page",
      type: "CANVAS",
      children: [{ id: "0:1", name: "Button", type: "COMPONENT_SET" }],
    };

    const found = findComponentNode(tree, "Button");
    expect(found?.type).toBe("COMPONENT_SET");
  });

  it("should return undefined if not found", () => {
    const tree: FigmaNode = {
      id: "0:0",
      name: "Page",
      type: "CANVAS",
      children: [{ id: "0:1", name: "Card", type: "COMPONENT" }],
    };

    expect(findComponentNode(tree, "Button")).toBeUndefined();
  });

  it("should find deeply nested components", () => {
    const tree: FigmaNode = {
      id: "0:0",
      name: "Root",
      type: "DOCUMENT",
      children: [
        {
          id: "0:1",
          name: "Page",
          type: "CANVAS",
          children: [
            {
              id: "0:2",
              name: "Frame",
              type: "FRAME",
              children: [{ id: "0:3", name: "Dialog", type: "COMPONENT" }],
            },
          ],
        },
      ],
    };

    const found = findComponentNode(tree, "dialog");
    if (!found) return expect(found).toBeDefined();
    expect(found.id).toBe("0:3");
  });
});
