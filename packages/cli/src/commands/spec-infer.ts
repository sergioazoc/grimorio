import { defineCommand } from "citty";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { basename, extname, join, dirname } from "node:path";
import consola from "consola";
import { analyzeReactFile, analyzeVueFile } from "grimorio-analyzers";
import type { ComponentSpec } from "grimorio-core";

export default defineCommand({
  meta: {
    name: "spec:infer",
    description: "Infer a component spec from source code",
  },
  args: {
    file: {
      type: "positional",
      description: "Path to the component file",
      required: true,
    },
    output: {
      type: "string",
      alias: "o",
      description: "Output path for the spec JSON",
    },
  },
  run: async ({ args }) => {
    const filePath = args.file;
    const source = await readFile(filePath, "utf-8");
    const ext = extname(filePath);

    let analysis;
    if (ext === ".vue") {
      analysis = analyzeVueFile(filePath, source);
    } else if ([".tsx", ".jsx", ".ts", ".js"].includes(ext)) {
      analysis = analyzeReactFile(filePath, source);
    } else {
      consola.error(`Unsupported file type: ${ext}`);
      process.exit(1);
    }

    // Extract events from props (on* handlers)
    const eventProps = analysis.props.filter((p) => /^on[A-Z]/.test(p.name));
    const nonEventProps = analysis.props.filter((p) => !/^on[A-Z]/.test(p.name));

    const spec: ComponentSpec = {
      name: analysis.name,
      complexity: "moderate",
      props: nonEventProps.map((p) => ({
        name: p.name,
        type: p.type,
        required: p.required,
        ...(p.defaultValue !== undefined ? { default: p.defaultValue } : {}),
      })),
      variants: analysis.variants,
      defaultVariants: {},
      slots: [],
      anatomy: [],
      tokenMapping: {},
      states: [],
      events: eventProps.map((p) => ({
        name: p.name,
        description: `Event handler: ${p.name}`,
      })),
      dependencies: analysis.imports
        .filter(
          (i) =>
            !i.source.startsWith(".") &&
            !i.source.startsWith("react") &&
            !i.source.startsWith("vue"),
        )
        .map((i) => i.source),
      accessibility:
        analysis.accessibilityAttrs.length > 0
          ? {
              role: analysis.accessibilityAttrs.find((a) => a.name === "role")?.value,
              ariaAttributes: analysis.accessibilityAttrs
                .filter((a) => a.name.startsWith("aria-"))
                .map((a) => a.name),
              keyboardInteractions: analysis.accessibilityAttrs
                .filter((a) => a.name.startsWith("onKey"))
                .map((a) => ({
                  key: a.name.replace("onKey", ""),
                  description: `Handles ${a.name}`,
                })),
            }
          : undefined,
      guidelines: [],
    };

    const outputPath =
      args.output ?? join("specs", `${basename(filePath, ext)}.json`.toLowerCase());

    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, JSON.stringify(spec, null, 2) + "\n");

    consola.success(`Spec generated: ${outputPath}`);
    consola.info(`  Name: ${spec.name}`);
    consola.info(`  Props: ${spec.props.length}`);
    consola.info(`  Variants: ${spec.variants.length}`);
  },
});
