---
title: Getting Started
---

# Getting Started

## Installation

Add grimorio as a dev dependency of your project:

```bash
pnpm add -D grimorio
```

::: tip
You can also install it globally (`npm install -g grimorio`) or use `npx grimorio` without installing. A local dev dependency is recommended so the version is pinned to your project.
:::

## Initialize your project

```bash
npx grimorio init
```

This creates:

- `grimorio.config.ts` -- project configuration
- `specs/` -- directory for component specs
- `tokens.json` -- example design tokens file (13 W3C DTCG categories with Tailwind-based values)

## Three paths to get started

### Path 1: Infer specs from existing code

If you already have components, grimorio can analyze them and generate specs automatically using static analysis.

```bash
npx grimorio spec:infer src/components/Button.tsx
npx grimorio validate
```

`spec:infer` extracts props, variants (cva), accessibility attributes, Tailwind classes, and dependencies from your component file. The output is a JSON spec in the `specs/` directory.

### Path 2: Start from scratch with presets

If you are building a new design system, use `add` to create specs from built-in presets.

```bash
npx grimorio add Button                    # auto-detects preset, generates full spec
npx grimorio add CustomWidget              # no preset match -> improved skeleton with a11y
```

grimorio includes 10 built-in presets: button, input, select, checkbox, dialog, card, avatar, badge, tabs, and textarea. Each preset includes complete props, variants, accessibility rules, and guidelines.

To see all available presets:

```bash
npx grimorio add --list-presets
```

Once you have specs, connect the [MCP server](/guide/mcp) to your AI client and use the `generate-component` prompt to generate code from the spec.

### Path 3: Import from Figma

If your design system lives in Figma, import component specs directly.

```bash
npx grimorio figma:import "https://figma.com/design/ABC/..." --component Button
```

The import maps Figma component properties to the spec format deterministically. After importing, connect the [MCP server](/guide/mcp) and use the `enrich-spec` prompt to add accessibility and guidelines. See the [Figma guide](/guide/figma) for mapping details.

## Validate your components

Once you have specs and components, run validation:

```bash
npx grimorio validate
npx grimorio validate --level strict
```

Validation checks that your implementations match the specs. See [Validation](/guide/validation) for details on the three levels.

## Configuration

grimorio is configured via `grimorio.config.ts` at the project root:

```ts
export default {
  specs: "./specs/**/*.json",
  tokens: "./tokens.json",
  components: "./src/components/**/*.{tsx,vue}",
  validation: {
    level: "standard",
  },
};
```

See the [Configuration Reference](/reference/configuration) for all options.

## Connect your AI assistant (optional)

Once you have specs and tokens set up, you can connect the MCP server to your AI client. This enables AI-assisted workflows like enriching specs, generating components, and auditing accessibility -- without configuring any API key in grimorio.

```bash
npx grimorio mcp:serve
```

Or add it to your MCP client config (see [MCP Server](/guide/mcp) for details):

```json
{
  "mcpServers": {
    "grimorio": {
      "command": "npx",
      "args": ["grimorio", "mcp:serve"]
    }
  }
}
```

See [AI-Friendly Workflows](/guide/ai) for a detailed comparison of when to use the CLI vs MCP.

## What to read next

- [Component Specs](/guide/component-specs) -- understand the spec format in detail
- [Design Tokens](/guide/design-tokens) -- W3C DTCG tokens and export formats
- [AI-Friendly Workflows](/guide/ai) -- CLI vs MCP: when to use each
- [MCP Server](/guide/mcp) -- setup and available tools
- [CLI Reference](/reference/cli) -- complete command documentation
