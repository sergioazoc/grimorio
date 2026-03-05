---
title: Token Format
---

# Token Format Reference

Complete reference for the W3C Design Tokens Community Group (DTCG) format as supported by grimorio.

## Token structure

A token is an object with a `$value` property:

```json
{
  "$value": "#3b82f6",
  "$type": "color",
  "$description": "Primary brand color",
  "$deprecated": false
}
```

### Token properties

| Property       | Type                                             | Required | Description                                    |
| -------------- | ------------------------------------------------ | -------- | ---------------------------------------------- |
| `$value`       | `string \| number \| boolean \| array \| object` | **yes**  | The token value                                |
| `$type`        | `string`                                         | no       | Token type. Can be inherited from parent group |
| `$description` | `string`                                         | no       | Human-readable description                     |
| `$deprecated`  | `boolean \| string`                              | no       | `true` or a string with deprecation reason     |
| `$extensions`  | `Record<string, unknown>`                        | no       | Vendor-specific extensions                     |

## Token groups

Tokens are organized in nested groups. A group is any object that does not have a `$value` property:

```json
{
  "color": {
    "$type": "color",
    "primary": { "$value": "#3b82f6" },
    "secondary": { "$value": "#6366f1" },
    "neutral": {
      "100": { "$value": "#f5f5f5" },
      "900": { "$value": "#171717" }
    }
  }
}
```

Groups can set `$type`, `$description`, and `$extensions`. These properties are inherited by child tokens.

### Type inheritance

When `$type` is set on a group, all descendant tokens inherit that type unless they override it:

```json
{
  "spacing": {
    "$type": "dimension",
    "sm": { "$value": "0.5rem" },
    "md": { "$value": "1rem" },
    "lg": { "$value": "1.5rem" }
  }
}
```

All three tokens (`spacing.sm`, `spacing.md`, `spacing.lg`) have type `dimension`.

## Supported $type values

| Type          | Value format     | Description                                 |
| ------------- | ---------------- | ------------------------------------------- |
| `color`       | string           | CSS color value (hex, rgb, hsl, etc.)       |
| `dimension`   | string           | CSS dimension (e.g., `1rem`, `16px`)        |
| `fontFamily`  | string           | Font family name                            |
| `fontWeight`  | string or number | Font weight (e.g., `400`, `bold`)           |
| `duration`    | string           | Time value (e.g., `200ms`, `0.3s`)          |
| `cubicBezier` | number[]         | Four-value array `[x1, y1, x2, y2]`         |
| `shadow`      | object           | Shadow definition (see composite types)     |
| `border`      | object           | Border definition (see composite types)     |
| `transition`  | object           | Transition definition (see composite types) |
| `gradient`    | object           | Gradient definition (see composite types)   |
| `strokeStyle` | string or object | Stroke/dash style                           |
| `number`      | number           | Plain number                                |
| `typography`  | object           | Typography composite (serialized as JSON)   |

## Token references

Tokens can reference other tokens using curly brace syntax:

```json
{
  "color": {
    "$type": "color",
    "base-blue": { "$value": "#3b82f6" },
    "primary": { "$value": "{color.base-blue}" }
  }
}
```

The path inside `{}` uses dot notation matching the token hierarchy. References are resolved during export.

::: info
Chained references (a references b, b references c) are resolved recursively. Circular references are detected and handled safely.
:::

## Composite types

### shadow

```json
{
  "$value": {
    "offsetX": "0px",
    "offsetY": "4px",
    "blur": "6px",
    "spread": "-1px",
    "color": "rgba(0, 0, 0, 0.1)"
  },
  "$type": "shadow"
}
```

**CSS output:** `0px 4px 6px -1px rgba(0, 0, 0, 0.1)`

### border

```json
{
  "$value": {
    "width": "1px",
    "style": "solid",
    "color": "#000"
  },
  "$type": "border"
}
```

**CSS output:** `1px solid #000`

### transition

```json
{
  "$value": {
    "property": "opacity",
    "duration": "200ms",
    "timingFunction": "ease-in-out",
    "delay": "0ms"
  },
  "$type": "transition"
}
```

**CSS output:** `opacity 200ms ease-in-out 0ms`

### gradient

```json
{
  "$value": {
    "type": "linear",
    "stops": [
      { "color": "#000", "position": "0%" },
      { "color": "#fff", "position": "100%" }
    ]
  },
  "$type": "gradient"
}
```

**CSS output:** `linear-gradient(#000 0%, #fff 100%)`

### cubicBezier

```json
{
  "$value": [0.4, 0, 0.2, 1],
  "$type": "cubicBezier"
}
```

**CSS output:** `cubic-bezier(0.4, 0, 0.2, 1)`

### strokeStyle

When the value is an object with a `dashArray`, it is serialized accordingly. When it is a plain string (e.g., `"solid"`, `"dashed"`), it is used as-is.

### typography

Typography composites are serialized as JSON strings in CSS output, as there is no single CSS property that maps to all typography fields.

## Deprecated tokens

Mark tokens as deprecated to flag usage during validation:

```json
{
  "color": {
    "old-primary": {
      "$value": "#3b82f6",
      "$deprecated": "Use color.primary instead"
    }
  }
}
```

The `$deprecated` field accepts `true` or a string with a migration message. During `tokens:validate`, specs referencing deprecated tokens trigger a warning.

## Export formats

### CSS

Generates CSS custom properties in a `:root` block:

```css
:root {
  /* Primary brand color */
  --color-primary: #3b82f6;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
}
```

With `--prefix ds`:

```css
:root {
  --ds-color-primary: #3b82f6;
}
```

### SCSS

Generates SCSS variables:

```scss
// Primary brand color
$color-primary: #3b82f6;
$spacing-sm: 0.5rem;
$spacing-md: 1rem;
```

### JS

Generates ES module exports with camelCase names:

```js
/** Primary brand color */
export const colorPrimary = "#3b82f6";
export const spacingSm = "0.5rem";
export const spacingMd = "1rem";
```

### Tailwind

Generates a Tailwind `theme.extend` configuration object:

```js
export default {
  colors: {
    primary: "#3b82f6",
  },
  spacing: {
    sm: "0.5rem",
    md: "1rem",
  },
};
```

## Multi-theme export

When the config defines multiple token files, CSS export combines all themes:

```css
:root {
  --color-primary: #3b82f6;
}
[data-theme="dark"] {
  --color-primary: #1e40af;
}
```

The `default` theme maps to `:root`. All other themes use `[data-theme="name"]` selectors.

For SCSS, JS, and Tailwind, use `--theme` to export a single theme:

```bash
grimorio tokens:export scss --theme dark
```

## Export options

| Option              | Description                                       |
| ------------------- | ------------------------------------------------- |
| `--prefix`          | Prefix for CSS/SCSS variable names                |
| `--no-descriptions` | Omit `$description` comments from output          |
| `--output, -o`      | Write to file instead of stdout                   |
| `--theme`           | Export a specific theme (for multi-theme configs) |

## Related pages

- [Design Tokens Guide](/guide/design-tokens) -- conceptual overview
- [Spec Schema](/reference/spec-schema) -- how specs reference tokens
- [CLI Commands](/reference/cli) -- `tokens:list`, `tokens:validate`, `tokens:export`
