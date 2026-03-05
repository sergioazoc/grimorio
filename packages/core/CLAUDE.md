# CLAUDE.md — grimorio-core

Foundation package. Defines the central contract (ComponentSpec), design tokens (W3C format), loaders, and presets. Everything else depends on this.

## Key APIs

```ts
// Schemas (Zod)
ComponentSpecSchema, PropSchema, VariantSchema, SlotSchema, AnatomyPartSchema, EventSchema, AccessibilitySchema
DesignTokenSchema, TokenGroupSchema, TokenFileSchema

// Types (inferred from Zod)
ComponentSpec, Prop, Variant, Slot, AnatomyPart, Event, Accessibility, DesignToken, TokenGroup, TokenFile

// Result pattern — use instead of throwing
ok(value) / err(error) → Result<T, E>

// Loaders — all return Result<T, string>
loadSpec(path) → Result<ComponentSpec>
loadAllSpecs(dir) → Result<ComponentSpec[]>  // fails on FIRST invalid spec
validateSpec(data) → Result<ComponentSpec>   // no disk I/O
loadTokens(path) → Result<TokenGroup>       // does NOT validate against schema
resolveTokenReference("color.primary", tokens) → Result<DesignToken>
flattenTokens(group) → Map<string, DesignToken>

// Presets
applyPreset(presetId, name, overrides?) → ComponentSpec
listPresetIds() → string[]
getBuiltinPresets() → Record<string, ComponentPreset>
getDefaultTokens() → TokenGroup  // 13 W3C DTCG categories, Tailwind values

// Spec comparison
compareSpecs(source, target) → SpecDiffResult  // structured diff between two specs

// Token export
exportTokens(tokens, format, options?) → Result<string, string>  // format: "css"|"scss"|"js"|"tailwind"
exportCssThemed(themes: Map<string, TokenGroup>, options?) → Result<string, string>  // multi-theme CSS
exportCss(tokens, options?) → Result<string, string>
exportScss(tokens, options?) → Result<string, string>
exportJs(tokens, options?) → Result<string, string>
exportTailwind(tokens, options?) → Result<string, string>
// ExportOptions = { prefix?: string, includeDescriptions?: boolean }
```

## Gotchas

- `loadAllSpecs` does early-exit on first invalid spec — no error accumulation.
- `loadTokens` does NOT validate against `TokenFileSchema`, it just parses JSON. Intentional for flexibility.
- `applyPreset` does **shallow merge** of overrides, not deep merge. Passing `props: [...]` replaces all preset props.
- `applyPreset` with unknown presetId returns an improved skeleton (always includes `accessibility`), not an error.
- `TokenGroupSchema` uses `z.lazy()` for recursive nesting.
- `resolveTokenReference` accepts both `"color.primary"` and `"{color.primary}"` formats.
- `DesignTokenSchema.$value` accepts arrays (for cubicBezier) in addition to string/number/boolean/record.

## ComponentSpec shape

```ts
{
  name: string,              // REQUIRED, no default
  description?: string,
  category?: string,         // "actions", "forms", "feedback", "navigation", "data-display", "layout"
  complexity: "simple" | "moderate" | "complex",  // default: "moderate"
  props: Prop[],             // default: []
  variants: Variant[],       // default: []
  defaultVariants: Record<string, string>,  // default: {}
  slots: Slot[],             // default: []
  anatomy: AnatomyPart[],    // component parts: {name, description?, required}, default: []
  tokenMapping: Record<string, string>,  // "part.property[:state][variant=value]" → "{token.path}", default: {}
  states: string[],          // e.g. ["hover", "focus", "active", "disabled"], default: []
  events: Event[],           // {name, description?}, default: []
  dependencies: string[],    // other components, default: []
  accessibility?: { role?, ariaAttributes: string[], keyboardInteractions: {key, description}[] },
  guidelines: string[],      // default: []
}
```

### tokenMapping key format

Keys follow `part.property[:state][variant=value]` convention:

- `root.background` — base style
- `root.background:hover` — state-specific
- `root.background[variant=secondary]` — variant-specific
- `root.background:hover[variant=secondary]` — state + variant

Values use W3C DTCG reference syntax: `{color.primary}`, `{spacing.md}`, etc.

## Presets

10 built-in component presets: button, input, select, checkbox, dialog, card, avatar, badge, tabs, textarea.

`ComponentPreset = Omit<ComponentSpec, "name">`. Each preset file is in `src/presets/components/{name}.ts`.

## Token presets and export

`getDefaultTokens()` in `src/presets/tokens/default-tokens.ts` returns a complete W3C DTCG token set with 13 categories: color, spacing, fontSize, fontFamily, fontWeight, lineHeight, letterSpacing, borderRadius, shadow, opacity, zIndex, duration, easing. Values follow Tailwind conventions.

Token exporters in `src/export/` convert `TokenGroup` to CSS custom properties, SCSS variables, JS/TS exports, or Tailwind theme config. `exportTokens()` dispatches to the correct exporter. `exportCssThemed(themes: Map<string, TokenGroup>, options?)` generates multi-theme CSS (`:root` + `[data-theme="name"]`). `flattenWithTypes(tokens, options?)` propagates `$type` from parent groups to child tokens and resolves `{path.to.token}` references by default (`resolveReferences: false` to disable). `formatTokenValue()` serializes composite values: shadow, border (`width style color`), transition (`property duration timingFunction delay`), gradient (`type-gradient(stops)`), strokeStyle (dashArray), cubicBezier (`cubic-bezier(...)`).

## Testing patterns

- Fixtures in `src/fixtures/` (button-spec.json, tokens.json, invalid-spec.json).
- Test Result discrimination: `if (result.ok) { expect(result.value...) }`.
- Presets test: iterate `listPresetIds()`, `applyPreset` each, validate with `ComponentSpecSchema.safeParse`.

## Build

- `isolatedDeclarations: false` — required because Zod types can't be isolated.
- Output: `dist/index.mjs` + `dist/index.d.mts` (ESM only).
- Deps: `zod` (catalog), `zod-to-json-schema`.
