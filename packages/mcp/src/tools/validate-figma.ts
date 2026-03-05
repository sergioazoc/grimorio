import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadAllSpecs, compareSpecs, ComponentSpecSchema } from "grimorio-core";
import type { McpServerConfig } from "../server.js";

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  componentPropertyDefinitions?: Record<
    string,
    {
      type: "BOOLEAN" | "TEXT" | "INSTANCE_SWAP" | "VARIANT";
      defaultValue: string | boolean;
      variantOptions?: string[];
    }
  >;
  boundVariables?: Record<string, FigmaBoundVariable | FigmaBoundVariable[]>;
  fills?: Array<{ boundVariables?: Record<string, FigmaBoundVariable> }>;
  strokes?: Array<{ boundVariables?: Record<string, FigmaBoundVariable> }>;
}

interface FigmaBoundVariable {
  type: string;
  id: string;
}

interface FigmaVariable {
  id: string;
  name: string;
  resolvedType: string;
}

export function registerValidateFigma(server: McpServer, config: McpServerConfig): void {
  server.tool(
    "validate_figma",
    "Validate a Figma component against an existing spec. Returns a structured diff report showing differences between Figma and the repo spec.",
    {
      url: z.string().describe("Figma file URL"),
      component: z.string().optional().describe("Component name to validate"),
    },
    async ({ url, component }) => {
      const figmaToken = process.env["FIGMA_TOKEN"];
      if (!figmaToken) {
        return {
          content: [
            { type: "text" as const, text: "FIGMA_TOKEN environment variable is required." },
          ],
        };
      }

      const parsed = parseFigmaUrl(url);
      if (!parsed) {
        return {
          content: [
            {
              type: "text" as const,
              text: "Invalid Figma URL. Expected: figma.com/design/<fileKey>/...",
            },
          ],
        };
      }

      const baseUrl = "https://api.figma.com/v1";
      const headers = { "X-Figma-Token": figmaToken };

      // Fetch file
      let fileUrl = `${baseUrl}/files/${parsed.fileKey}`;
      if (parsed.nodeId) fileUrl += `?ids=${parsed.nodeId}`;

      const fileResponse = await fetch(fileUrl, { headers });
      if (!fileResponse.ok) {
        return {
          content: [{ type: "text" as const, text: `Figma API error: ${fileResponse.status}` }],
        };
      }
      const file = (await fileResponse.json()) as { document: FigmaNode };

      // Try to fetch variables
      let variables: Record<string, FigmaVariable> | undefined;
      try {
        const varsResponse = await fetch(`${baseUrl}/files/${parsed.fileKey}/variables/local`, {
          headers,
        });
        if (varsResponse.ok) {
          const varsData = (await varsResponse.json()) as {
            meta: { variables: Record<string, FigmaVariable> };
          };
          variables = varsData.meta.variables;
        }
      } catch {
        // Variables may not be available
      }

      const rootNode = parsed.nodeId ? findNodeById(file.document, parsed.nodeId) : file.document;

      if (!rootNode) {
        return {
          content: [{ type: "text" as const, text: "Could not find the specified node." }],
        };
      }

      let targetNode = rootNode;
      if (component) {
        const found = findComponentNode(rootNode, component);
        if (!found) {
          return {
            content: [{ type: "text" as const, text: `Component "${component}" not found.` }],
          };
        }
        targetNode = found;
      } else if (targetNode.type !== "COMPONENT" && targetNode.type !== "COMPONENT_SET") {
        const components = findAllComponents(rootNode);
        if (components.length === 0) {
          return {
            content: [{ type: "text" as const, text: "No components found in the file." }],
          };
        }
        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  message: "Multiple components found. Specify one with the component parameter.",
                  components: components.map((c) => ({ name: c.name, type: c.type })),
                },
                null,
                2,
              ),
            },
          ],
        };
      }

      const componentName = component ?? targetNode.name;
      const figmaSpec = mapFigmaToSpec(componentName, targetNode, variables);

      const validation = ComponentSpecSchema.safeParse(figmaSpec);
      if (!validation.success) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Generated spec from Figma is invalid: ${validation.error.issues.map((i) => i.message).join(", ")}`,
            },
          ],
        };
      }

      // Load existing specs
      const specsDir = config.specs?.replace(/\/\*\*\/\*\.json$/, "") ?? "specs";
      const specsResult = await loadAllSpecs(specsDir);

      if (!specsResult.ok) {
        return {
          content: [{ type: "text" as const, text: `Failed to load specs: ${specsResult.error}` }],
        };
      }

      const repoSpec = specsResult.value.find(
        (s: { name: string }) => s.name.toLowerCase() === componentName.toLowerCase(),
      );

      if (!repoSpec) {
        return {
          content: [
            {
              type: "text" as const,
              text: `No spec found for "${componentName}". Use import_from_figma first to create the spec.`,
            },
          ],
        };
      }

      const diff = compareSpecs(validation.data, repoSpec);

      return {
        content: [{ type: "text" as const, text: JSON.stringify(diff, null, 2) }],
      };
    },
  );
}

// --- Self-contained Figma utilities (same pattern as import-from-figma.ts) ---

function parseFigmaUrl(url: string): { fileKey: string; nodeId?: string } | null {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("figma.com")) return null;
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    const typeIndex = pathParts.findIndex((p) => p === "design" || p === "file");
    if (typeIndex === -1 || !pathParts[typeIndex + 1]) return null;
    let fileKey = pathParts[typeIndex + 1];
    if (pathParts[typeIndex + 2] === "branch" && pathParts[typeIndex + 3]) {
      fileKey = pathParts[typeIndex + 3]!;
    }
    const nodeIdParam = parsed.searchParams.get("node-id");
    const nodeId = nodeIdParam?.replace(/-/g, ":") ?? undefined;
    return { fileKey, nodeId };
  } catch {
    return null;
  }
}

function findNodeById(root: FigmaNode, id: string): FigmaNode | undefined {
  if (root.id === id) return root;
  if (root.children) {
    for (const child of root.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  return undefined;
}

function findComponentNode(root: FigmaNode, name: string): FigmaNode | undefined {
  const lower = name.toLowerCase();
  if (
    (root.type === "COMPONENT" || root.type === "COMPONENT_SET") &&
    root.name.toLowerCase() === lower
  ) {
    return root;
  }
  if (root.children) {
    for (const child of root.children) {
      const found = findComponentNode(child, name);
      if (found) return found;
    }
  }
  return undefined;
}

function findAllComponents(root: FigmaNode): FigmaNode[] {
  const results: FigmaNode[] = [];
  if (root.type === "COMPONENT" || root.type === "COMPONENT_SET") results.push(root);
  if (root.children) {
    for (const child of root.children) results.push(...findAllComponents(child));
  }
  return results;
}

function camelCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr: string) => chr.toUpperCase())
    .replace(/^[A-Z]/, (chr) => chr.toLowerCase());
}

function cleanPropertyName(name: string): string {
  return camelCase(name.replace(/#[\d:]+$/, "").trim());
}

function mapFigmaToSpec(name: string, node: FigmaNode, variables?: Record<string, FigmaVariable>) {
  const properties = node.componentPropertyDefinitions ?? {};
  const props: Array<{
    name: string;
    type: string;
    required: boolean;
    default?: unknown;
    description?: string;
  }> = [];
  const variants: Array<{ name: string; values: string[]; description?: string }> = [];
  const defaultVariants: Record<string, string> = {};
  const slots: Array<{ name: string; description?: string; required?: boolean }> = [];
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
        if (typeof prop.defaultValue === "string") defaultVariants[cleanName] = prop.defaultValue;
        props.push({
          name: cleanName,
          type: "string",
          required: false,
          default: prop.defaultValue,
          description: `Variant: ${values.join(", ")}`,
        });
        break;
      }
      case "BOOLEAN":
        props.push({
          name: cleanName,
          type: "boolean",
          required: false,
          default: prop.defaultValue,
          description: `Toggle: ${cleanName}`,
        });
        break;
      case "TEXT":
        props.push({
          name: cleanName,
          type: "string",
          required: false,
          default: prop.defaultValue,
          description: `Text content: ${cleanName}`,
        });
        break;
      case "INSTANCE_SWAP":
        slots.push({
          name: cleanName,
          description: `Slot for swappable content: ${cleanName}`,
          required: false,
        });
        break;
    }
  }

  if (variables) collectTokenMapping(node, variables, tokenMapping);

  const complexity =
    props.length + variants.length > 8
      ? "complex"
      : props.length + variants.length > 3
        ? "moderate"
        : "simple";

  return {
    name,
    description: `${name} component (imported from Figma)`,
    category: guessCategory(name),
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
    accessibility: { ariaAttributes: [], keyboardInteractions: [] },
    guidelines: [
      "Imported from Figma — review and enrich anatomy, states, events, accessibility, and guidelines.",
    ],
  };
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

function collectTokenMapping(
  node: FigmaNode,
  variables: Record<string, FigmaVariable>,
  mapping: Record<string, string>,
  nodeName?: string,
): void {
  const partName = nodeName ?? camelCase(node.name);
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
  if (node.children) {
    for (const child of node.children) {
      collectTokenMapping(child, variables, mapping, camelCase(child.name));
    }
  }
}
