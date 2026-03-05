import { defineCommand } from "citty";
import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import consola from "consola";
import { applyPreset, listPresetIds } from "grimorio-core";

export default defineCommand({
  meta: {
    name: "add",
    description: "Add a component spec (uses built-in presets when available)",
  },
  args: {
    name: {
      type: "positional",
      description: "Component name",
    },
    category: {
      type: "string",
      alias: "c",
      description: "Component category",
    },
    preset: {
      type: "string",
      alias: "p",
      description: "Use a specific preset",
    },
    description: {
      type: "string",
      alias: "d",
      description: "Component description",
    },
    "list-presets": {
      type: "boolean",
      description: "List available presets and exit",
      default: false,
    },
  },
  run: async ({ args }) => {
    if (args["list-presets"]) {
      const ids = listPresetIds();
      consola.info(`Available presets (${ids.length}):`);
      for (const id of ids) {
        consola.log(`  - ${id}`);
      }
      return;
    }

    const name = args.name;
    if (!name) {
      consola.error("Component name is required. Usage: grimorio add <name>");
      process.exit(1);
    }

    const presetIds = listPresetIds();
    const presetId = args.preset ?? (presetIds.includes(name.toLowerCase()) ? name : undefined);

    if (presetId && !args.preset && presetIds.includes(presetId.toLowerCase())) {
      consola.info(`Using preset: ${presetId.toLowerCase()}`);
    }

    const overrides: Record<string, unknown> = {};
    if (args.description) overrides.description = args.description;
    if (args.category) overrides.category = args.category;

    const spec = applyPreset(presetId ?? name, name, overrides);

    const specsDir = "specs";
    if (!existsSync(specsDir)) {
      await mkdir(specsDir, { recursive: true });
    }

    const outputPath = join(specsDir, `${name.toLowerCase()}.json`);
    if (existsSync(outputPath)) {
      consola.error(`Spec already exists: ${outputPath}`);
      process.exit(1);
    }

    await writeFile(outputPath, JSON.stringify(spec, null, 2) + "\n");
    consola.success(`Created spec: ${outputPath}`);
  },
});
