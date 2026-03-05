import { parseSync } from "oxc-parser";
import type { AnalyzedComponent, ImportInfo, ExportInfo } from "../types.js";
import { extractProps } from "./extract-props.js";
import { extractVariants } from "./extract-variants.js";
import { extractTailwindClasses } from "./extract-tailwind.js";
import { extractAccessibility } from "./extract-a11y.js";

export function analyzeReactFile(filename: string, source: string): AnalyzedComponent {
  const result = parseSync(filename, source, { sourceType: "module" });
  const program = result.program;

  const props = extractProps(program);
  const variants = extractVariants(program);
  const tailwindClasses = extractTailwindClasses(program);
  const accessibilityAttrs = extractAccessibility(program);
  const imports = extractImports(program);
  const exports = extractExports(program);

  // Determine component name from exports or filename
  const componentName = findComponentName(exports, filename);

  return {
    name: componentName,
    filePath: filename,
    framework: "react",
    props,
    variants,
    tailwindClasses,
    accessibilityAttrs,
    imports,
    exports,
  };
}

function findComponentName(exports: ExportInfo[], filename: string): string {
  const defaultExport = exports.find((e) => e.isDefault);
  if (defaultExport && defaultExport.name !== "default") return defaultExport.name;

  const namedExport = exports.find((e) => /^[A-Z]/.test(e.name));
  if (namedExport) return namedExport.name;

  // Fallback: derive from filename
  const base =
    filename
      .split("/")
      .pop()
      ?.replace(/\.(tsx?|jsx?)$/, "") ?? "Unknown";
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function extractImports(program: any): ImportInfo[] {
  const imports: ImportInfo[] = [];

  for (const node of program.body) {
    if (node.type === "ImportDeclaration") {
      const source = node.source.value;
      const specifiers: string[] = [];
      let isDefault = false;

      for (const spec of node.specifiers ?? []) {
        if (spec.type === "ImportDefaultSpecifier") {
          specifiers.push(spec.local.name);
          isDefault = true;
        } else if (spec.type === "ImportSpecifier") {
          specifiers.push(spec.imported?.name ?? spec.local.name);
        } else if (spec.type === "ImportNamespaceSpecifier") {
          specifiers.push(`* as ${spec.local.name}`);
        }
      }

      imports.push({ source, specifiers, isDefault });
    }
  }

  return imports;
}

function extractExports(program: any): ExportInfo[] {
  const exports: ExportInfo[] = [];

  for (const node of program.body) {
    if (node.type === "ExportDefaultDeclaration") {
      const name = node.declaration?.id?.name ?? node.declaration?.name ?? "default";
      exports.push({ name, isDefault: true });
    } else if (node.type === "ExportNamedDeclaration") {
      if (node.declaration) {
        if (node.declaration.id) {
          exports.push({ name: node.declaration.id.name, isDefault: false });
        } else if (node.declaration.declarations) {
          for (const decl of node.declaration.declarations) {
            if (decl.id?.name) {
              exports.push({ name: decl.id.name, isDefault: false });
            }
          }
        }
      }
      for (const spec of node.specifiers ?? []) {
        exports.push({
          name: spec.exported?.name ?? spec.local.name,
          isDefault: false,
        });
      }
    }
  }

  return exports;
}
