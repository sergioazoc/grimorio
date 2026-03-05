import { defineCommand } from "citty";
import consola from "consola";
import { loadAllSpecs, compareSpecs } from "grimorio-core";
import type { SpecDiffResult } from "grimorio-core";
import { createFigmaClient, parseFigmaUrl } from "../figma/client.js";
import { mapFigmaToSpec, findComponentNode } from "../figma/mapper.js";
import { resolveConfig } from "../config.js";

export default defineCommand({
  meta: {
    name: "figma:validate",
    description: "Validate a Figma component against an existing spec",
  },
  args: {
    url: {
      type: "positional",
      description: "Figma file URL",
      required: true,
    },
    component: {
      type: "string",
      description: "Component name to validate",
    },
    token: {
      type: "string",
      description: "Figma API token (or set FIGMA_TOKEN env var)",
    },
    json: {
      type: "boolean",
      description: "Output as JSON",
      default: false,
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

    let variables: Record<string, import("../figma/client.js").FigmaVariable> | undefined;
    try {
      const varsResponse = await client.getVariables(parsed.fileKey);
      variables = varsResponse.meta.variables;
    } catch {
      consola.debug("Could not fetch variables (may require a paid plan).");
    }

    const rootNode = parsed.nodeId ? findNodeById(file.document, parsed.nodeId) : file.document;

    if (!rootNode) {
      consola.error("Could not find the specified node in the Figma file.");
      process.exit(1);
    }

    let targetNode = rootNode;
    if (args.component) {
      const found = findComponentNode(rootNode, args.component);
      if (!found) {
        consola.error(`Component "${args.component}" not found in the Figma file.`);
        process.exit(1);
      }
      targetNode = found;
    } else if (rootNode.type !== "COMPONENT" && rootNode.type !== "COMPONENT_SET") {
      const components = findAllComponents(rootNode);
      if (components.length === 0) {
        consola.error("No components found. Use --component to specify the target.");
        process.exit(1);
      }
      consola.info(`Found ${components.length} component(s):`);
      for (const c of components) {
        consola.log(`  - ${c.name} (${c.type})`);
      }
      consola.info("Use --component <name> to validate a specific component.");
      return;
    }

    const componentName = args.component ?? targetNode.name;
    const figmaSpec = mapFigmaToSpec(componentName, targetNode, { variables });

    // Load existing specs
    const specsGlob = config.specs ?? "specs/**/*.json";
    const specsDir = specsGlob.replace(/\/\*\*\/\*\.json$/, "");
    const specsResult = await loadAllSpecs(specsDir);

    if (!specsResult.ok) {
      consola.error(`Failed to load specs: ${specsResult.error}`);
      process.exit(1);
    }

    const repoSpec = specsResult.value.find(
      (s) => s.name.toLowerCase() === componentName.toLowerCase(),
    );

    if (!repoSpec) {
      consola.error(
        `No spec found for "${componentName}". Run figma:import first to create the spec.`,
      );
      process.exit(1);
    }

    const diff = compareSpecs(figmaSpec, repoSpec);

    if (args.json) {
      consola.log(JSON.stringify(diff, null, 2));
    } else {
      formatDiffResult(diff);
    }

    if (!diff.inSync) {
      process.exit(1);
    }
  },
});

function formatDiffResult(result: SpecDiffResult): void {
  if (result.inSync) {
    consola.success(`${result.componentName}: Figma and spec are in sync`);
    return;
  }

  consola.log(`\n✗ ${result.componentName}: ${result.totalDifferences} difference(s)\n`);

  const categories = [
    "props",
    "variants",
    "tokenMapping",
    "slots",
    "anatomy",
    "states",
    "events",
  ] as const;
  for (const cat of categories) {
    const items = result.differences.filter((d) => d.category === cat);
    if (items.length === 0) continue;

    consola.log(`  ${cat.charAt(0).toUpperCase() + cat.slice(1)}:`);
    for (const item of items) {
      const icon = item.type === "missing" ? "+" : item.type === "extra" ? "-" : "~";
      consola.log(`    ${icon} ${item.message}`);
    }
  }

  consola.log("");
}

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
