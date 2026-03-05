---
title: Configuration
---

# Configuration

grimorio is configured via `grimorio.config.ts` at the project root. Configuration is loaded using [c12](https://github.com/unjs/c12) and validated with Zod.

## Full example

```ts
export default {
  // Glob pattern for component spec files
  specs: "./specs/**/*.json",

  // Token file path (string) or multi-theme config (Record<string, string>)
  tokens: "./tokens.json",

  // Glob pattern for component source files
  components: "./src/components/**/*.{tsx,vue}",

  // Validation settings
  validation: {
    level: "standard", // "basic" | "standard" | "strict"
  },

  // Figma integration
  figma: {
    // token: "figd_...", // or set FIGMA_TOKEN env var
  },
};
```

## Fields

### specs

- **Type:** `string`
- **Default:** `"./specs/**/*.json"`

Glob pattern to locate component spec JSON files.

### tokens

- **Type:** `string | Record<string, string>`
- **Default:** `"./tokens.json"`

Path to the design tokens file. For multi-theme setups, use a record mapping theme names to file paths:

```ts
tokens: {
  default: "./tokens.json",
  dark: "./tokens-dark.json",
  "high-contrast": "./tokens-hc.json",
}
```

The `default` key maps to `:root` when exporting CSS. Other keys generate `[data-theme="name"]` selectors.

::: info
Commands that operate on a single theme (like `mcp:serve`) use the `default` theme when tokens is a record.
:::

### components

- **Type:** `string`
- **Default:** `"./src/components/**/*.{tsx,vue}"`

Glob pattern to locate component source files for analysis and validation.

### validation.level

- **Type:** `"basic" | "standard" | "strict"`
- **Default:** `"standard"`

The default validation level. Can be overridden per-run with `--level`.

### figma.token

- **Type:** `string`
- **Default:** none

Figma API token for the `figma:import` command. Alternatively, set the `FIGMA_TOKEN` environment variable.

## Validation behavior

The configuration is validated with a Zod schema using `.strip()` (unknown fields are silently removed). When a field has an invalid value:

1. A warning is logged via `consola.warn`
2. The field falls back to its default value
3. grimorio continues to run

This means an invalid config will not crash grimorio -- it will use defaults and warn you about the issues.

::: warning
Fields with invalid values silently fall back to defaults. Check console output for warnings if grimorio is not behaving as expected.
:::

## Environment variables

| Variable      | Used by        | Description     |
| ------------- | -------------- | --------------- |
| `FIGMA_TOKEN` | `figma:import` | Figma API token |

## Related pages

- [Getting Started](/guide/getting-started) -- initial setup
- [CLI Commands](/reference/cli) -- command-specific options
- [Validation](/guide/validation) -- validation levels in detail
