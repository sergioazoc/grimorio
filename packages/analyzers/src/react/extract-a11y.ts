import type { AccessibilityAttr } from "../types.js";

export function extractAccessibility(program: any): AccessibilityAttr[] {
  const attrs: AccessibilityAttr[] = [];

  walkNode(program, (node: any) => {
    if (node.type === "JSXAttribute") {
      const name = node.name?.name ?? "";

      if (
        name.startsWith("aria-") ||
        name === "role" ||
        name === "tabIndex" ||
        name === "onKeyDown" ||
        name === "onKeyUp" ||
        name === "onKeyPress"
      ) {
        const value = extractAttrValue(node.value);
        attrs.push({ name, value });
      }
    }
  });

  return attrs;
}

function extractAttrValue(node: any): string | undefined {
  if (!node) return undefined;
  if (
    node.type === "StringLiteral" ||
    (node.type === "Literal" && typeof node.value === "string")
  ) {
    return String(node.value);
  }
  if (node.type === "JSXExpressionContainer") {
    if (
      node.expression?.type === "StringLiteral" ||
      (node.expression?.type === "Literal" && typeof node.expression?.value === "string")
    ) {
      return String(node.expression.value);
    }
    if (
      node.expression?.type === "BooleanLiteral" ||
      (node.expression?.type === "Literal" && typeof node.expression?.value === "boolean")
    ) {
      return String(node.expression.value);
    }
  }
  return undefined;
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
