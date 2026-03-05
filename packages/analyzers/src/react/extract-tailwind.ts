export function extractTailwindClasses(program: any): string[] {
  const classes = new Set<string>();

  walkNode(program, (node: any) => {
    // JSX className attribute
    if (
      node.type === "JSXAttribute" &&
      (node.name?.name === "className" || node.name?.name === "class")
    ) {
      extractClassesFromValue(node.value, classes);
    }
  });

  return [...classes];
}

function extractClassesFromValue(node: any, classes: Set<string>): void {
  if (!node) return;

  if (
    node.type === "StringLiteral" ||
    (node.type === "Literal" && typeof node.value === "string")
  ) {
    for (const cls of String(node.value).split(/\s+/)) {
      if (cls) classes.add(cls);
    }
  }

  // JSXExpressionContainer wrapping a string or template
  if (node.type === "JSXExpressionContainer") {
    extractClassesFromValue(node.expression, classes);
  }

  if (node.type === "TemplateLiteral") {
    for (const quasi of node.quasis ?? []) {
      const raw = quasi.value?.raw ?? quasi.value?.cooked ?? "";
      for (const cls of String(raw).split(/\s+/)) {
        if (cls) classes.add(cls);
      }
    }
  }

  // Template literal inside expression
  if (node.type === "TaggedTemplateExpression") {
    extractClassesFromValue(node.quasi, classes);
  }

  // Calls like cn(), clsx(), etc. - extract string args
  if (node.type === "CallExpression") {
    for (const arg of node.arguments ?? []) {
      if (
        arg.type === "StringLiteral" ||
        (arg.type === "Literal" && typeof arg.value === "string")
      ) {
        for (const cls of String(arg.value).split(/\s+/)) {
          if (cls) classes.add(cls);
        }
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
