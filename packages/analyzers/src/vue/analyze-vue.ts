import { parse as parseSFC } from "@vue/compiler-sfc";
import { parseSync } from "oxc-parser";
import type {
  AnalyzedComponent,
  AnalyzedProp,
  AnalyzedVariant,
  AccessibilityAttr,
} from "../types.js";

export function analyzeVueFile(filename: string, source: string): AnalyzedComponent {
  const { descriptor } = parseSFC(source, { filename });

  let props: AnalyzedProp[] = [];
  let variants: AnalyzedVariant[] = [];
  let tailwindClasses: string[] = [];
  let accessibilityAttrs: AccessibilityAttr[] = [];

  if (descriptor.scriptSetup) {
    const scriptContent = descriptor.scriptSetup.content;
    const result = parseSync(`${filename}.ts`, scriptContent, { sourceType: "module" });
    const program = result.program;

    props = extractVueProps(program);
    variants = extractVueVariants(program);
  } else if (descriptor.script) {
    const scriptContent = descriptor.script.content;
    const result = parseSync(`${filename}.ts`, scriptContent, { sourceType: "module" });
    const program = result.program;

    props = extractVueProps(program);
    variants = extractVueVariants(program);
  }

  // Extract tailwind from template
  if (descriptor.template) {
    tailwindClasses = extractClassesFromTemplate(descriptor.template.content);
    accessibilityAttrs = extractA11yFromTemplate(descriptor.template.content);
  }

  const componentName =
    filename
      .split("/")
      .pop()
      ?.replace(/\.vue$/, "") ?? "Unknown";

  return {
    name: componentName,
    filePath: filename,
    framework: "vue",
    props,
    variants,
    tailwindClasses,
    accessibilityAttrs,
    imports: [],
    exports: [{ name: componentName, isDefault: true }],
  };
}

function extractVueProps(program: any): AnalyzedProp[] {
  const props: AnalyzedProp[] = [];

  walkNode(program, (node: any) => {
    // defineProps<{ ... }>() or defineProps({ ... })
    if (node.type === "CallExpression" && node.callee?.name === "defineProps") {
      // Type parameter approach: defineProps<Props>()
      // oxc-parser uses "typeArguments" (not "typeParameters")
      const typeParams = node.typeArguments ?? node.typeParameters;
      if (typeParams?.params?.[0]?.type === "TSTypeLiteral") {
        for (const member of typeParams.params[0].members ?? []) {
          if (member.type === "TSPropertySignature") {
            props.push({
              name: member.key?.name ?? member.key?.value ?? "",
              type: extractTypeString(member.typeAnnotation?.typeAnnotation),
              required: !member.optional,
            });
          }
        }
      }

      // Object syntax: defineProps({ variant: { type: String } })
      if (node.arguments?.[0]?.type === "ObjectExpression") {
        for (const prop of node.arguments[0].properties ?? []) {
          const name = prop.key?.name ?? prop.key?.value;
          if (!name) continue;

          if (prop.value?.type === "ObjectExpression") {
            const required = prop.value.properties?.find((p: any) => p.key?.name === "required");
            props.push({
              name,
              type: extractPropType(prop.value),
              required: required?.value?.value === true,
            });
          } else {
            props.push({ name, type: "unknown", required: false });
          }
        }
      }
    }

    // withDefaults(defineProps<...>(), { ... })
    if (node.type === "CallExpression" && node.callee?.name === "withDefaults") {
      const definePropsCall = node.arguments?.[0];
      if (definePropsCall?.callee?.name === "defineProps") {
        // Extract props from defineProps type params
        // oxc-parser uses "typeArguments" (not "typeParameters")
        const typeParams = definePropsCall.typeArguments ?? definePropsCall.typeParameters;
        if (typeParams?.params?.[0]?.type === "TSTypeLiteral") {
          for (const member of typeParams.params[0].members ?? []) {
            if (member.type === "TSPropertySignature") {
              const propName = member.key?.name ?? member.key?.value ?? "";
              props.push({
                name: propName,
                type: extractTypeString(member.typeAnnotation?.typeAnnotation),
                required: !member.optional,
              });
            }
          }
        }

        // Extract defaults from second argument
        const defaults = node.arguments?.[1];
        if (defaults?.type === "ObjectExpression") {
          for (const prop of defaults.properties ?? []) {
            const name = prop.key?.name ?? prop.key?.value;
            const existing = props.find((p) => p.name === name);
            if (existing && prop.value) {
              existing.defaultValue = extractLiteralValue(prop.value);
            }
          }
        }
      }
    }
  });

  return props;
}

function extractVueVariants(program: any): AnalyzedVariant[] {
  const variants: AnalyzedVariant[] = [];
  walkNode(program, (node: any) => {
    if (node.type === "CallExpression" && node.callee?.name === "cva") {
      extractCvaVariants(node, variants);
    }
  });
  return variants;
}

function extractCvaVariants(node: any, variants: AnalyzedVariant[]): void {
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

function extractClassesFromTemplate(template: string): string[] {
  const classes = new Set<string>();
  // Simple regex extraction from class="..." and :class="..."
  const classRegex = /(?:class|:class)="([^"]+)"/g;
  let match;
  while ((match = classRegex.exec(template)) !== null) {
    for (const cls of match[1].split(/\s+/)) {
      if (cls && !cls.startsWith("{") && !cls.includes("?")) {
        classes.add(cls);
      }
    }
  }
  return [...classes];
}

function extractA11yFromTemplate(template: string): AccessibilityAttr[] {
  const attrs: AccessibilityAttr[] = [];
  const attrRegex = /(aria-[\w-]+|role|tabindex)="([^"]*)"/gi;
  let match;
  while ((match = attrRegex.exec(template)) !== null) {
    attrs.push({ name: match[1], value: match[2] });
  }
  return attrs;
}

function extractTypeString(typeNode: any): string {
  if (!typeNode) return "unknown";
  switch (typeNode.type) {
    case "TSStringKeyword":
      return "string";
    case "TSNumberKeyword":
      return "number";
    case "TSBooleanKeyword":
      return "boolean";
    case "TSTypeReference":
      return typeNode.typeName?.name ?? "unknown";
    case "TSUnionType":
      return typeNode.types?.map((t: any) => extractTypeString(t)).join(" | ") ?? "unknown";
    case "TSLiteralType":
      return String(typeNode.literal?.value ?? typeNode.literal?.raw ?? "unknown");
    default:
      return "unknown";
  }
}

function extractPropType(objExpr: any): string {
  const typeProp = objExpr.properties?.find((p: any) => p.key?.name === "type");
  if (typeProp?.value?.name) return typeProp.value.name.toLowerCase();
  return "unknown";
}

function extractLiteralValue(node: any): string | undefined {
  if (!node) return undefined;
  if (node.type === "StringLiteral" || node.type === "Literal") return String(node.value);
  if (node.type === "NumericLiteral") return String(node.value);
  if (node.type === "BooleanLiteral") return String(node.value);
  return undefined;
}

function walkNode(node: any, visitor: (node: any) => void): void {
  if (!node || typeof node !== "object") return;
  visitor(node);
  for (const key of Object.keys(node)) {
    const child = node[key];
    if (Array.isArray(child)) {
      for (const item of child) {
        if (item && typeof item === "object") walkNode(item, visitor);
      }
    } else if (child && typeof child === "object" && child.type) {
      walkNode(child, visitor);
    }
  }
}
