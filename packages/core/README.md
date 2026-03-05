# grimorio-core

Foundation package for grimorio. Defines the schemas, types, loaders, and presets that all other packages depend on.

## What it provides

### Schemas (Zod)

- **`ComponentSpecSchema`** — The central contract: props, variants, slots, tokens, accessibility, guidelines, parts.
- **`DesignTokenSchema`** / **`TokenFileSchema`** — W3C Design Tokens format with nested groups, `$value`, `$type`, `$description`.

```ts
import { ComponentSpecSchema, type ComponentSpec } from "grimorio-core";

const result = ComponentSpecSchema.safeParse(data);
if (result.success) {
  const spec: ComponentSpec = result.data;
}
```

### Result type

All loaders return `Result<T, E>` instead of throwing:

```ts
import { ok, err, type Result } from "grimorio-core";

// { ok: true, value: T } | { ok: false, error: E }
```

### Loaders

- **`loadSpec(path)`** — Load and validate a component spec JSON file.
- **`loadAllSpecs(dir)`** — Recursively load all specs from a directory.
- **`validateSpec(data)`** — Validate arbitrary data against `ComponentSpecSchema`.
- **`loadTokens(path)`** — Load a W3C design tokens JSON file.
- **`resolveTokenReference(ref, tokens)`** — Resolve `"{color.primary}"` to a token value.
- **`flattenTokens(group)`** — Flatten nested token groups into a `Map<string, DesignToken>`.

### Presets

10 built-in component presets with full specs (props, variants, accessibility, guidelines):

```ts
import { applyPreset, listPresetIds } from "grimorio-core";

listPresetIds(); // ["button", "input", "select", "checkbox", "dialog", "card", "avatar", "badge", "tabs", "textarea"]

const spec = applyPreset("button", "MyButton");
// → Complete ComponentSpec with name "MyButton", role="button", Enter/Space handlers, etc.

const skeleton = applyPreset("custom-widget", "CustomWidget");
// → Improved skeleton with empty accessibility structure
```

### JSON Schema generation

```ts
import { generateComponentSpecJsonSchema, generateTokenFileJsonSchema } from "grimorio-core";

const schema = generateComponentSpecJsonSchema(); // JSON Schema from Zod
```

## Dependencies

- `zod` — Schema validation
- `zod-to-json-schema` — JSON Schema generation

## Structure

```
src/
├── schemas/
│   ├── component-spec.ts    # ComponentSpec schema and types
│   └── design-tokens.ts     # W3C Design Tokens schema
├── loaders/
│   ├── spec-loader.ts       # Load/validate spec files
│   └── token-loader.ts      # Load/resolve/flatten tokens
├── presets/
│   ├── types.ts             # ComponentPreset type
│   ├── registry.ts          # applyPreset, listPresetIds, getBuiltinPresets
│   └── components/          # 10 preset files (button, input, etc.)
├── result.ts                # Result<T, E>, ok(), err()
├── json-schema.ts           # Zod → JSON Schema conversion
└── index.ts                 # Barrel export
```
