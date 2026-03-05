import type { ComponentSpec, Prop, Variant } from "grimorio-core";
import type { FigmaNode, FigmaVariable } from "./client.js";

interface MappingContext {
  variables?: Record<string, FigmaVariable>;
}

/**
 * Deterministic mapping from Figma component properties to a ComponentSpec.
 * No AI involved — pure static transformation.
 */
export function mapFigmaToSpec(
  componentName: string,
  node: FigmaNode,
  ctx: MappingContext = {},
): ComponentSpec {
  const properties = node.componentPropertyDefinitions ?? {};

  const props: Prop[] = [];
  const variants: Variant[] = [];
  const defaultVariants: Record<string, string> = {};
  const slots: ComponentSpec["slots"] = [];
  const tokenMapping: Record<string, string> = {};

  for (const [key, prop] of Object.entries(properties)) {
    const cleanName = cleanPropertyName(key);

    switch (prop.type) {
      case "VARIANT": {
        const values = prop.variantOptions ?? [];
        variants.push({
          name: cleanName,
          values,
          description: `Figma variant: ${cleanName}`,
        });
        if (typeof prop.defaultValue === "string") {
          defaultVariants[cleanName] = prop.defaultValue;
        }
        // Also add as prop
        props.push({
          name: cleanName,
          type: "string",
          required: false,
          default: prop.defaultValue,
          description: `Variant: ${values.join(", ")}`,
        });
        break;
      }
      case "BOOLEAN": {
        props.push({
          name: cleanName,
          type: "boolean",
          required: false,
          default: prop.defaultValue,
          description: `Toggle: ${cleanName}`,
        });
        break;
      }
      case "TEXT": {
        props.push({
          name: cleanName,
          type: "string",
          required: false,
          default: prop.defaultValue,
          description: `Text content: ${cleanName}`,
        });
        break;
      }
      case "INSTANCE_SWAP": {
        // Instance swap → slot
        slots.push({
          name: cleanName,
          description: `Slot for swappable content: ${cleanName}`,
          required: false,
        });
        break;
      }
    }
  }

  // Extract token mappings from bound variables
  if (ctx.variables) {
    collectTokenMappingFromNode(node, ctx.variables, tokenMapping);
  }

  // Determine complexity
  const complexity =
    props.length + variants.length > 8
      ? "complex"
      : props.length + variants.length > 3
        ? "moderate"
        : "simple";

  return {
    name: componentName,
    description: `${componentName} component (imported from Figma)`,
    category: guessCategory(componentName),
    complexity,
    props,
    variants,
    defaultVariants,
    slots,
    anatomy: [],
    tokenMapping,
    states: [],
    events: [],
    dependencies: [],
    accessibility: {
      ariaAttributes: [],
      keyboardInteractions: [],
    },
    guidelines: [
      "Imported from Figma — review and enrich anatomy, states, events, accessibility, and guidelines.",
    ],
  };
}

/**
 * Clean Figma property names (e.g., "Has Icon#1234:5" → "hasIcon").
 */
function cleanPropertyName(name: string): string {
  // Remove Figma node ID suffix (e.g., "#1234:5")
  const cleaned = name.replace(/#[\d:]+$/, "").trim();
  // Convert "Has Icon" → "hasIcon"
  return camelCase(cleaned);
}

function camelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr: string) => chr.toUpperCase())
    .replace(/^[A-Z]/, (chr) => chr.toLowerCase());
}

function guessCategory(name: string): string {
  const lower = name.toLowerCase();
  if (/button|link|action/.test(lower)) return "actions";
  if (/input|select|checkbox|radio|textarea|form|switch|toggle/.test(lower)) return "forms";
  if (/dialog|modal|toast|alert|snackbar|notification/.test(lower)) return "feedback";
  if (/tab|nav|menu|breadcrumb|sidebar|drawer/.test(lower)) return "navigation";
  if (/card|avatar|badge|tag|chip|list|table/.test(lower)) return "data-display";
  if (/grid|stack|container|divider|spacer/.test(lower)) return "layout";
  return "uncategorized";
}

const FIGMA_PROP_MAP: Record<string, string> = {
  fills: "background",
  strokes: "borderColor",
  opacity: "opacity",
  cornerRadius: "borderRadius",
  paddingLeft: "paddingInline",
  paddingRight: "paddingInline",
  paddingTop: "paddingBlock",
  paddingBottom: "paddingBlock",
  itemSpacing: "gap",
  fontSize: "fontSize",
  fontFamily: "fontFamily",
  fontWeight: "fontWeight",
  lineHeight: "lineHeight",
  letterSpacing: "letterSpacing",
};

function collectTokenMappingFromNode(
  node: FigmaNode,
  variables: Record<string, FigmaVariable>,
  mapping: Record<string, string>,
  nodeName?: string,
): void {
  const partName = nodeName ?? camelCase(node.name);

  // Check bound variables on the node
  if (node.boundVariables) {
    for (const [figmaProp, bindings] of Object.entries(node.boundVariables)) {
      const bindingArray = Array.isArray(bindings) ? bindings : [bindings];
      for (const binding of bindingArray) {
        const variable = variables[binding.id];
        if (variable) {
          const cssProp = FIGMA_PROP_MAP[figmaProp] ?? figmaProp;
          const tokenPath = variable.name.replace(/\//g, ".");
          mapping[`${partName}.${cssProp}`] = `{${tokenPath}}`;
        }
      }
    }
  }

  // Check fills and strokes
  for (const paint of [...(node.fills ?? []), ...(node.strokes ?? [])]) {
    if (paint.boundVariables) {
      for (const [figmaProp, binding] of Object.entries(paint.boundVariables)) {
        const variable = variables[binding.id];
        if (variable) {
          const tokenPath = variable.name.replace(/\//g, ".");
          const cssProp =
            figmaProp === "color"
              ? node.fills?.includes(paint)
                ? "background"
                : "borderColor"
              : figmaProp;
          mapping[`${partName}.${cssProp}`] = `{${tokenPath}}`;
        }
      }
    }
  }

  // Recurse into children
  if (node.children) {
    for (const child of node.children) {
      collectTokenMappingFromNode(child, variables, mapping, camelCase(child.name));
    }
  }
}

/**
 * Find a component node by name within the Figma file tree.
 */
export function findComponentNode(root: FigmaNode, componentName: string): FigmaNode | undefined {
  const lower = componentName.toLowerCase();

  if (
    (root.type === "COMPONENT" || root.type === "COMPONENT_SET") &&
    root.name.toLowerCase() === lower
  ) {
    return root;
  }

  if (root.children) {
    for (const child of root.children) {
      const found = findComponentNode(child, componentName);
      if (found) return found;
    }
  }

  return undefined;
}
