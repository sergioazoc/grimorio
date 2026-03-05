import type { AnalyzedVariant } from "../types.js";

export function extractVariants(program: any): AnalyzedVariant[] {
  const variants: AnalyzedVariant[] = [];
  walkNode(program, (node: any) => {
    if (
      node.type === "CallExpression" &&
      (node.callee?.name === "cva" ||
        (node.callee?.type === "Identifier" && node.callee?.name === "cva"))
    ) {
      extractFromCvaCall(node, variants);
    }
  });
  return variants;
}

function extractFromCvaCall(node: any, variants: AnalyzedVariant[]): void {
  // cva("base-class", { variants: { ... }, defaultVariants: { ... } })
  const configArg = node.arguments?.[1];
  if (!configArg || configArg.type !== "ObjectExpression") return;

  for (const prop of configArg.properties ?? []) {
    if (prop.key?.name === "variants" && prop.value?.type === "ObjectExpression") {
      for (const variantProp of prop.value.properties ?? []) {
        const variantName = variantProp.key?.name ?? variantProp.key?.value;
        if (!variantName) continue;

        const values: string[] = [];
        if (variantProp.value?.type === "ObjectExpression") {
          for (const valueProp of variantProp.value.properties ?? []) {
            const val = valueProp.key?.name ?? valueProp.key?.value;
            if (val) values.push(String(val));
          }
        }

        variants.push({ name: variantName, values });
      }
    }
  }
}

function walkNode(node: any, visitor: (node: any) => void): void {
  if (!node || typeof node !== "object") return;
  visitor(node);

  for (const key of Object.keys(node)) {
    const child = node[key];
    if (Array.isArray(child)) {
      for (const item of child) {
        if (item && typeof item === "object") {
          walkNode(item, visitor);
        }
      }
    } else if (child && typeof child === "object" && child.type) {
      walkNode(child, visitor);
    }
  }
}
