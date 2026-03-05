import type { AnalyzedProp } from "../types.js";

export function extractProps(program: any): AnalyzedProp[] {
  const props: AnalyzedProp[] = [];

  // Strategy 1: Find Props interface/type
  for (const node of program.body) {
    if (node.type === "ExportNamedDeclaration" && node.declaration) {
      extractFromTypeDeclaration(node.declaration, props);
    }
    extractFromTypeDeclaration(node, props);
  }

  // Strategy 2: Extract from function component parameters
  for (const node of program.body) {
    extractFromFunctionParams(node, props);
    if (node.type === "ExportDefaultDeclaration" && node.declaration) {
      extractFromFunctionParams(node.declaration, props);
    }
    if (node.type === "ExportNamedDeclaration" && node.declaration) {
      extractFromFunctionParams(node.declaration, props);
    }
  }

  // Deduplicate by name
  const seen = new Set<string>();
  return props.filter((p) => {
    if (seen.has(p.name)) return false;
    seen.add(p.name);
    return true;
  });
}

function extractFromTypeDeclaration(node: any, props: AnalyzedProp[]): void {
  // TSInterfaceDeclaration or TSTypeAliasDeclaration with "Props" in name
  if (node.type === "TSInterfaceDeclaration" && node.id?.name?.includes("Props")) {
    for (const member of node.body?.body ?? []) {
      if (member.type === "TSPropertySignature") {
        props.push({
          name: member.key?.name ?? member.key?.value ?? "",
          type: extractTypeString(member.typeAnnotation?.typeAnnotation),
          required: !member.optional,
        });
      }
    }
  }

  if (node.type === "TSTypeAliasDeclaration" && node.id?.name?.includes("Props")) {
    if (node.typeAnnotation?.type === "TSTypeLiteral") {
      for (const member of node.typeAnnotation.members ?? []) {
        if (member.type === "TSPropertySignature") {
          props.push({
            name: member.key?.name ?? member.key?.value ?? "",
            type: extractTypeString(member.typeAnnotation?.typeAnnotation),
            required: !member.optional,
          });
        }
      }
    }
  }
}

function extractFromFunctionParams(node: any, props: AnalyzedProp[]): void {
  const func = getFunctionNode(node);
  if (!func) return;

  const firstParam = func.params?.[0];
  if (!firstParam) return;

  // Destructured params: function Comp({ variant, size }: Props)
  if (firstParam.type === "ObjectPattern") {
    for (const prop of firstParam.properties ?? []) {
      if (prop.type === "Property" && prop.key) {
        const name = prop.key.name ?? prop.key.value;
        if (name && !props.some((p) => p.name === name)) {
          props.push({
            name,
            type: "unknown",
            required: !prop.value || prop.value.type !== "AssignmentPattern",
            defaultValue:
              prop.value?.type === "AssignmentPattern"
                ? extractLiteralValue(prop.value.right)
                : undefined,
          });
        }
      }
    }
  }

  // Type annotation on first param
  if (firstParam.typeAnnotation?.typeAnnotation?.type === "TSTypeLiteral") {
    for (const member of firstParam.typeAnnotation.typeAnnotation.members ?? []) {
      if (member.type === "TSPropertySignature") {
        const name = member.key?.name ?? member.key?.value ?? "";
        if (name && !props.some((p) => p.name === name)) {
          props.push({
            name,
            type: extractTypeString(member.typeAnnotation?.typeAnnotation),
            required: !member.optional,
          });
        }
      }
    }
  }
}

function getFunctionNode(node: any): any {
  if (node.type === "FunctionDeclaration") return node;
  if (node.type === "VariableDeclaration") {
    const decl = node.declarations?.[0];
    if (
      decl?.init?.type === "ArrowFunctionExpression" ||
      decl?.init?.type === "FunctionExpression"
    ) {
      return decl.init;
    }
  }
  return null;
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

function extractLiteralValue(node: any): string | undefined {
  if (!node) return undefined;
  if (node.type === "StringLiteral" || node.type === "Literal") return String(node.value);
  if (node.type === "NumericLiteral") return String(node.value);
  if (node.type === "BooleanLiteral") return String(node.value);
  return undefined;
}
