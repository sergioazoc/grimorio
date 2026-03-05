import { defineCommand } from "citty";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import consola from "consola";
import { ComponentSpecSchema } from "grimorio-core";
import { createFigmaClient, parseFigmaUrl } from "../figma/client.js";
import { mapFigmaToSpec, findComponentNode } from "../figma/mapper.js";
import { resolveConfig } from "../config.js";

export default defineCommand({
  meta: {
    name: "figma:import",
    description: "Import component specs from Figma",
  },
  args: {
    url: {
      type: "positional",
      description: "Figma file URL",
      required: true,
    },
    component: {
      type: "string",
      description: "Component name to find in the file",
    },
    token: {
      type: "string",
      description: "Figma API token (or set FIGMA_TOKEN env var)",
    },
    output: {
      type: "string",
      alias: "o",
      description: "Output path for the spec JSON",
    },
  },
  run: async ({ args }) => {
    const config = await resolveConfig();
    const figmaToken = args.token ?? config.figma?.token ?? process.env["FIGMA_TOKEN"];

    if (!figmaToken) {
      consola.error(
        "Figma API token required. Pass --token, set FIGMA_TOKEN env var, or add figma.token to grimorio.config.ts.",
      );
      process.exit(1);
    }

    const parsed = parseFigmaUrl(args.url);
    if (!parsed) {
      consola.error("Invalid Figma URL. Expected: figma.com/design/<fileKey>/...");
      process.exit(1);
    }

    const client = createFigmaClient(figmaToken);

    consola.start("Fetching Figma file...");
    const file = await client.getFile(parsed.fileKey, parsed.nodeId);

    // Try to fetch variables for token mapping
    let variables: Record<string, import("../figma/client.js").FigmaVariable> | undefined;
    try {
      const varsResponse = await client.getVariables(parsed.fileKey);
      variables = varsResponse.meta.variables;
    } catch {
      consola.debug("Could not fetch variables (may require a paid plan).");
    }

    // Find the target node
    const rootNode = parsed.nodeId ? findNodeById(file.document, parsed.nodeId) : file.document;

    if (!rootNode) {
      consola.error("Could not find the specified node in the Figma file.");
      process.exit(1);
    }

    // If --component specified, search for it within the tree
    let targetNode = rootNode;
    if (args.component) {
      const found = findComponentNode(rootNode, args.component);
      if (!found) {
        consola.error(`Component "${args.component}" not found in the Figma file.`);
        process.exit(1);
      }
      targetNode = found;
    } else if (rootNode.type !== "COMPONENT" && rootNode.type !== "COMPONENT_SET") {
      // List available components
      const components = findAllComponents(rootNode);
      if (components.length === 0) {
        consola.error("No components found. Use --component to specify the target.");
        process.exit(1);
      }
      consola.info(`Found ${components.length} component(s):`);
      for (const c of components) {
        consola.log(`  - ${c.name} (${c.type})`);
      }
      consola.info("Use --component <name> to import a specific component.");
      return;
    }

    const componentName = args.component ?? targetNode.name;
    const spec = mapFigmaToSpec(componentName, targetNode, { variables });

    // Validate the generated spec
    const validation = ComponentSpecSchema.safeParse(spec);
    if (!validation.success) {
      consola.error("Generated spec is invalid:");
      for (const issue of validation.error.issues) {
        consola.error(`  ${issue.path.join(".")}: ${issue.message}`);
      }
      process.exit(1);
    }

    const outputPath = args.output ?? join("specs", `${componentName.toLowerCase()}.json`);

    await mkdir(dirname(outputPath), { recursive: true });

    if (existsSync(outputPath)) {
      consola.warn(`Overwriting existing spec: ${outputPath}`);
    }

    await writeFile(outputPath, JSON.stringify(validation.data, null, 2) + "\n");
    consola.success(`Imported spec: ${outputPath}`);
    consola.info(`  Name: ${spec.name}`);
    consola.info(`  Props: ${spec.props.length}`);
    consola.info(`  Variants: ${spec.variants.length}`);
    consola.info(`  Token mappings: ${Object.keys(spec.tokenMapping).length}`);

    if (spec.guidelines.some((g) => g.includes("review"))) {
      consola.info(
        "\nConnect grimorio MCP to your AI client and use the enrich-spec prompt to add accessibility and guidelines.",
      );
    }
  },
});

function findNodeById(
  root: import("../figma/client.js").FigmaNode,
  id: string,
): import("../figma/client.js").FigmaNode | undefined {
  if (root.id === id) return root;
  if (root.children) {
    for (const child of root.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  return undefined;
}

function findAllComponents(
  root: import("../figma/client.js").FigmaNode,
): import("../figma/client.js").FigmaNode[] {
  const results: import("../figma/client.js").FigmaNode[] = [];
  if (root.type === "COMPONENT" || root.type === "COMPONENT_SET") {
    results.push(root);
  }
  if (root.children) {
    for (const child of root.children) {
      results.push(...findAllComponents(child));
    }
  }
  return results;
}
