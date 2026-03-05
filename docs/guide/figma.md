---
title: Figma Integration
---

# Figma Integration

grimorio can import component specs directly from Figma files. The import is fully deterministic -- no AI is involved. Figma component properties are mapped to spec fields using fixed rules.

## Usage

```bash
# Import a specific component
grimorio figma:import "https://figma.com/design/ABC/..." --component Button

# List available components in the file
grimorio figma:import "https://figma.com/design/ABC/..."

# Import using a node ID from the URL
grimorio figma:import "https://figma.com/design/ABC/...?node-id=1-234"
```

## Authentication

You need a Figma API token. Provide it via:

- The `--token` flag: `grimorio figma:import <url> --token figd_...`
- The `FIGMA_TOKEN` environment variable
- The `figma.token` field in `grimorio.config.ts`

```ts
// grimorio.config.ts
export default {
  figma: {
    token: "figd_...",
  },
};
```

::: tip
Using the environment variable or config file avoids passing the token on every command.
:::

## Options

| Option         | Description                                    |
| -------------- | ---------------------------------------------- |
| `--component`  | Component name to find in the Figma file       |
| `--token`      | Figma API token (or set `FIGMA_TOKEN` env var) |
| `--output, -o` | Output path for the generated spec             |

## Mapping rules

Figma component properties are mapped to spec fields as follows:

| Figma property type | Spec field             | Details                                                                                                                                |
| ------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `VARIANT`           | `variants` and `props` | Each variant property becomes a variant axis with its options as values, and a corresponding string prop                               |
| `BOOLEAN`           | `props`                | Mapped to a boolean prop                                                                                                               |
| `TEXT`              | `props`                | Mapped to a string prop                                                                                                                |
| `INSTANCE_SWAP`     | `slots`                | Mapped to a named slot                                                                                                                 |
| Bound variables     | `tokenMapping`         | Figma variables bound to properties are extracted as token references in `{token.path}` syntax. Figma `/` notation is converted to `.` |

### Example

A Figma Button component with:

- Variant property `Size` with options `sm`, `md`, `lg`
- Variant property `Style` with options `primary`, `secondary`
- Boolean property `Disabled`
- Instance swap property `Icon`
- Color variable bound to fill

Produces a spec with:

```json
{
  "name": "Button",
  "variants": [
    { "name": "size", "values": ["sm", "md", "lg"] },
    { "name": "style", "values": ["primary", "secondary"] }
  ],
  "props": [
    { "name": "size", "type": "string", "required": false },
    { "name": "style", "type": "string", "required": false },
    { "name": "disabled", "type": "boolean", "required": false }
  ],
  "slots": [{ "name": "icon" }],
  "tokenMapping": {
    "root.background": "{color.primary}"
  },
  "anatomy": [],
  "states": [],
  "events": []
}
```

## Validating Figma against a spec

Once you have a spec in your repo, you can validate that a Figma component matches it:

```bash
grimorio figma:validate "https://figma.com/design/ABC/..." --component Button
```

This compares the Figma component against the existing spec and reports differences:

- Props that exist in Figma but not in the spec (and vice versa)
- Props with different types or required status
- Variants with different values
- Missing or extra token mappings, slots, anatomy parts, states, and events

Exit code 1 if differences are found, making it usable in CI.

Via MCP, a designer can tell their AI: _"Validate my Button in Figma against the spec"_ and the AI will call `validate_figma` and report what needs to change.

## Enriching after import

Figma imports produce a structural spec but lack accessibility rules and implementation guidelines. Connect the [MCP server](/guide/mcp) to your AI client and use the `enrich-spec` prompt to add ARIA attributes, keyboard interactions, and best-practice guidelines.

```bash
# 1. Import from Figma
grimorio figma:import "https://figma.com/design/ABC/..." --component Button

# 2. Start the MCP server
grimorio mcp:serve

# 3. Tell your AI: "Use the enrich-spec prompt for Button"
```

See [AI-Friendly Workflows](/guide/ai) for details on available MCP prompts.

## Related pages

- [Component Specs](/guide/component-specs) -- understanding the spec format
- [AI-Friendly Workflows](/guide/ai) -- enriching specs via MCP prompts
- [MCP Server](/guide/mcp) -- setup and available tools
- [Getting Started](/guide/getting-started) -- the Figma import path
