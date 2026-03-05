---
title: Design Tokens
---

# Design Tokens

grimorio uses the [W3C Design Tokens Community Group (DTCG)](https://design-tokens.github.io/community-group/format/) format for design tokens. Tokens are stored in JSON files and can be exported to CSS, SCSS, JS, or Tailwind formats.

## Basic structure

A token file is a nested JSON object. Groups organize tokens hierarchically, and individual tokens are identified by their `$value` property:

```json
{
  "color": {
    "$type": "color",
    "primary": {
      "$value": "#3b82f6",
      "$description": "Primary brand color"
    }
  },
  "spacing": {
    "$type": "dimension",
    "sm": { "$value": "0.5rem" },
    "md": { "$value": "1rem" }
  }
}
```

### Token properties

| Property       | Type                                      | Description                                                              |
| -------------- | ----------------------------------------- | ------------------------------------------------------------------------ |
| `$value`       | string, number, boolean, array, or object | The token's value. Required for leaf tokens                              |
| `$type`        | string                                    | The token type. Can be set on a group to apply to all children           |
| `$description` | string                                    | Human-readable description                                               |
| `$deprecated`  | boolean or string                         | Marks the token as deprecated. Can be `true` or a string with the reason |
| `$extensions`  | object                                    | Vendor-specific extensions                                               |

### Type inheritance

When `$type` is set on a group, all child tokens inherit that type:

```json
{
  "color": {
    "$type": "color",
    "primary": { "$value": "#3b82f6" },
    "secondary": { "$value": "#6366f1" }
  }
}
```

Both `color.primary` and `color.secondary` have type `color`.

## Token references

Tokens can reference other tokens using the `{path.to.token}` syntax:

```json
{
  "color": {
    "$type": "color",
    "base": { "$value": "#3b82f6" },
    "primary": { "$value": "{color.base}" }
  }
}
```

References are resolved automatically during export. Chained references and circular references are handled safely.

## Composite types

grimorio supports several composite token types that serialize to appropriate CSS values:

### shadow

```json
{
  "shadow": {
    "$type": "shadow",
    "md": {
      "$value": {
        "offsetX": "0px",
        "offsetY": "4px",
        "blur": "6px",
        "spread": "-1px",
        "color": "rgba(0, 0, 0, 0.1)"
      }
    }
  }
}
```

CSS output: `0px 4px 6px -1px rgba(0, 0, 0, 0.1)`

### border

```json
{
  "border": {
    "$type": "border",
    "default": {
      "$value": {
        "width": "1px",
        "style": "solid",
        "color": "#000"
      }
    }
  }
}
```

CSS output: `1px solid #000`

### transition

```json
{
  "transition": {
    "$type": "transition",
    "fade": {
      "$value": {
        "property": "opacity",
        "duration": "200ms",
        "timingFunction": "ease-in-out",
        "delay": "0ms"
      }
    }
  }
}
```

CSS output: `opacity 200ms ease-in-out 0ms`

### gradient

```json
{
  "gradient": {
    "$type": "gradient",
    "primary": {
      "$value": {
        "type": "linear",
        "stops": [
          { "color": "#000", "position": "0%" },
          { "color": "#fff", "position": "100%" }
        ]
      }
    }
  }
}
```

CSS output: `linear-gradient(#000 0%, #fff 100%)`

### cubicBezier

```json
{
  "easing": {
    "$type": "cubicBezier",
    "ease-out": {
      "$value": [0.4, 0, 0.2, 1]
    }
  }
}
```

CSS output: `cubic-bezier(0.4, 0, 0.2, 1)`

## Default tokens

When you run `grimorio init`, a complete token set is generated with 13 W3C DTCG categories using Tailwind-based values:

- color, spacing, fontSize, fontFamily, fontWeight, lineHeight, letterSpacing, borderRadius, shadow, opacity, zIndex, duration, easing

## Multi-theme tokens

Configure multiple token files in `grimorio.config.ts`:

```ts
export default {
  tokens: {
    default: "./tokens.json",
    dark: "./tokens-dark.json",
  },
};
```

When exporting to CSS, all themes are combined in a single file:

```css
:root {
  --color-primary: #3b82f6;
}
[data-theme="dark"] {
  --color-primary: #1e40af;
}
```

The `default` theme maps to `:root`, and additional themes use `[data-theme="name"]` selectors.

For SCSS, JS, and Tailwind formats, use `--theme` to export a specific theme:

```bash
grimorio tokens:export scss --theme dark
```

::: info
`tokens:validate` validates all themes automatically. `tokens:list` defaults to the `default` theme; use `--theme` to inspect another.
:::

## Token export formats

Export tokens using:

```bash
grimorio tokens:export <format>
```

| Format     | Output                              | Example                              |
| ---------- | ----------------------------------- | ------------------------------------ |
| `css`      | CSS custom properties in `:root {}` | `--color-primary: #3b82f6;`          |
| `scss`     | SCSS variables                      | `$color-primary: #3b82f6;`           |
| `js`       | ES module exports                   | `export const colorPrimary = "...";` |
| `tailwind` | Tailwind `theme.extend` config      | `colors: { primary: "..." }`         |

Options:

| Option              | Description                        |
| ------------------- | ---------------------------------- |
| `--output, -o`      | Output file path (default: stdout) |
| `--prefix`          | Prefix for CSS/SCSS variable names |
| `--no-descriptions` | Omit description comments          |
| `--theme`           | Export a specific theme            |

```bash
grimorio tokens:export css
grimorio tokens:export scss --prefix ds
grimorio tokens:export js --no-descriptions
grimorio tokens:export tailwind -o tailwind.tokens.js
```

## Token validation

Validate your tokens with:

```bash
grimorio tokens:validate
grimorio tokens:validate --watch
```

This checks schema validity, reports statistics by type, flags deprecated tokens, and cross-references tokens against component specs. See [Validation](/guide/validation) for details.

## Related pages

- [Token Format Reference](/reference/token-format) -- full reference for all supported types and export details
- [Component Specs](/guide/component-specs) -- how specs reference tokens
- [Validation](/guide/validation) -- token cross-reference validation
