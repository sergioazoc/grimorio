# grimorio-analyzers

Static analysis of React and Vue components. Extracts props, variants, Tailwind classes, accessibility attributes, imports, and exports from source code — no AI involved.

## What it provides

### `analyzeReactFile(filename, source)`

Analyzes a React/TSX component and returns an `AnalyzedComponent`:

```ts
import { analyzeReactFile } from "grimorio-analyzers";

const analysis = analyzeReactFile("Button.tsx", sourceCode);
// analysis.name        → "Button"
// analysis.props       → [{ name: "variant", type: "string", required: false, defaultValue: "primary" }]
// analysis.variants    → [{ name: "variant", values: ["primary", "secondary"] }]
// analysis.tailwindClasses → ["bg-blue-500", "px-4", "py-2"]
// analysis.accessibilityAttrs → [{ name: "role", value: "button" }, { name: "aria-disabled" }]
// analysis.imports     → [{ source: "react", specifiers: ["useState"] }]
// analysis.exports     → [{ name: "Button", isDefault: true }]
```

### `analyzeVueFile(filename, source)`

Same interface for Vue SFCs (`.vue` files). Uses `@vue/compiler-sfc` to parse `<script setup>` and `<template>`.

### `extractVariants(source)`

Extracts `cva()` variant definitions from source code:

```ts
import { extractVariants } from "grimorio-analyzers";

const variants = extractVariants(sourceCode);
// [{ name: "variant", values: ["primary", "secondary", "ghost"] }]
```

### `resolveImport(specifier, fromFile)`

Resolves import paths using `oxc-resolver`.

## How it works

- **React**: Parses with `oxc-parser` (Rust-based, very fast). Walks the AST to find interface/type props, JSX accessibility attributes, Tailwind class strings, and `cva()` calls.
- **Vue**: Parses SFC with `@vue/compiler-sfc`, then analyzes the `<script setup>` block with `oxc-parser` and scans the template for accessibility attributes.

## Dependencies

- `oxc-parser` — Rust-based JS/TS parser
- `oxc-resolver` — Module resolution
- `@vue/compiler-sfc` — Vue SFC compiler
- `grimorio-core` — Shared types

## Structure

```
src/
├── types.ts                       # AnalyzedComponent, AnalyzedProp, etc.
├── react/
│   ├── analyze-react.ts           # Full React/TSX analysis
│   └── extract-variants.ts        # cva() variant extraction
├── vue/
│   └── analyze-vue.ts             # Full Vue SFC analysis
├── resolver.ts                    # Import path resolution
└── index.ts                       # Barrel export
```
