# CLAUDE.md — grimorio-analyzers

Static analysis of React and Vue components. Extracts props, variants, Tailwind classes, a11y attrs, imports, and exports from source code. No AI.

## Key APIs

```ts
analyzeReactFile(filename, source) → AnalyzedComponent
analyzeVueFile(filename, source) → AnalyzedComponent
extractVariants(source) → AnalyzedVariant[]  // cva() extraction only
resolveImport(specifier, fromFile) → Result<string>
```

## AnalyzedComponent shape

```ts
{
  name: string,
  filePath: string,
  framework: "react" | "vue",
  props: AnalyzedProp[],           // { name, type, required, defaultValue? }
  variants: AnalyzedVariant[],     // { name, values[] }
  tailwindClasses: string[],       // flat list of class names
  accessibilityAttrs: AccessibilityAttr[],  // { name, value? }
  imports: ImportInfo[],           // { source, specifiers[], isDefault }
  exports: ExportInfo[],           // { name, isDefault }
}
```

## oxc-parser gotchas

- **Call signature**: `parseSync(filename, sourceText, { sourceType: "module" })` — first arg is filename string.
- **`result.program`** is already a JS object, not a wrapper.
- **Use `typeArguments`**, not `typeParameters` — this is the oxc-parser convention for CallExpression generic args.
- **Node types**: `StringLiteral`, `NumericLiteral`, `BooleanLiteral`, `TemplateLiteral`, `CallExpression`, `ObjectExpression`.
- **JSX**: `JSXAttribute` → `node.name?.name` for attr name, `node.value` for value (StringLiteral or JSXExpressionContainer).

## React analysis internals

Props extraction (two strategies, deduped):

1. `TSInterfaceDeclaration` / `TSTypeAliasDeclaration` with "Props" in name → extract `TSPropertySignature` members.
2. Function params with `ObjectPattern` destructuring → extract properties + `AssignmentPattern` defaults.

Variant extraction: walks AST for `CallExpression` with `callee.name === "cva"`, reads second arg's `variants` key.

Tailwind: only literal strings from `className`/`class` JSX attrs. Does NOT capture dynamic values.

A11y: captures `aria-*`, `role`, `tabIndex`, `onKeyDown`, `onKeyUp`, `onKeyPress`.

## Vue analysis internals

- Parses SFC with `@vue/compiler-sfc` `parseSFC()`.
- Props: `defineProps<{...}>()` (type parameter approach) or `defineProps({...})` (object syntax) or `withDefaults(defineProps<...>(), {...})`.
- Template a11y/tailwind: extracted via regex, not AST.
- Imports/exports: not extracted for Vue (returns empty arrays / filename-based default).

## Limitations

- Tailwind: only string literals, not dynamic expressions.
- Vue imports: always empty array.
- cva(): only top-level calls, not inside nested functions.
- Vue a11y: only from template (regex), not from script.

## Testing

- Fixtures: `src/fixtures/Button.tsx`, `src/fixtures/Card.vue`.
- Tests load fixtures with `readFileSync`.
- Variant tests use inline code strings parsed with `parseSync`.

## Deps

- `oxc-parser` — Rust-based JS/TS parser
- `oxc-resolver` — module resolution
- `@vue/compiler-sfc` — Vue SFC compiler
- `grimorio-core` — shared types
