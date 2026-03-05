import { z } from "zod";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { basename, extname, join, dirname } from "node:path";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ComponentSpec } from "grimorio-core";
import { analyzeReactFile, analyzeVueFile } from "grimorio-analyzers";

export function registerInferSpec(server: McpServer): void {
  server.tool(
    "infer_spec",
    "Infer a component spec from source code by statically analyzing props, variants, accessibility, and imports",
    {
      file: z.string().describe("Path to the component file (.tsx, .jsx, .vue)"),
      output: z.string().optional().describe("Output path for the spec JSON"),
    },
    async ({ file, output }) => {
      const source = await readFile(file, "utf-8");
      const ext = extname(file);

      let analysis;
      if (ext === ".vue") {
        analysis = analyzeVueFile(file, source);
      } else if ([".tsx", ".jsx", ".ts", ".js"].includes(ext)) {
        analysis = analyzeReactFile(file, source);
      } else {
        return {
          content: [{ type: "text" as const, text: `Unsupported file type: ${ext}` }],
        };
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

      const outputPath = output ?? join("specs", `${basename(file, ext)}.json`.toLowerCase());

      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, JSON.stringify(spec, null, 2) + "\n");

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                created: outputPath,
                name: spec.name,
                props: spec.props.length,
                variants: spec.variants.length,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );
}
