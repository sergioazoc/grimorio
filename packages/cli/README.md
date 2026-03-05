# grimorio

The CLI for grimorio — analyze components, manage specs, validate implementations, and bridge design with development.

This is the only public package in the monorepo. It orchestrates all other packages.

## Install

```bash
npm install -g grimorio
```

## Commands

### `grimorio init`

Scaffolds the project: creates `grimorio.config.ts`, `specs/` directory, and `tokens.json`.

### `grimorio add <name>`

Creates a component spec. Auto-detects built-in presets by name.

```bash
grimorio add Button                    # uses "button" preset → full spec
grimorio add Select -d "Country picker" # preset + custom description
grimorio add CustomWidget              # no matching preset → improved skeleton
grimorio add --list-presets            # list available presets
```

Built-in presets: button, input, select, checkbox, dialog, card, avatar, badge, tabs, textarea.

### `grimorio spec:infer <file>`

Infers a spec from a component source file via static analysis (no AI).

```bash
grimorio spec:infer src/components/Button.tsx
grimorio spec:infer src/components/Modal.vue -o specs/modal.json
```

### `grimorio validate`

Validates all components against their specs and design tokens.

```bash
grimorio validate
grimorio validate --level strict
grimorio validate --watch              # re-validate on file changes
```

### `grimorio figma:import <url>`

Imports component specs from Figma deterministically (no AI). Maps Figma component properties to props, variants, slots, and token mappings.

```bash
grimorio figma:import "https://figma.com/design/ABC/..." --component Button
```

Requires a Figma API token (`--token`, `FIGMA_TOKEN` env var, or `figma.token` in config).

### `grimorio figma:validate <url>`

Validates a Figma component against an existing spec. Reports differences in props, variants, token mappings, slots, anatomy, states, and events.

```bash
grimorio figma:validate "https://figma.com/design/ABC/..." --component Button
```

### `grimorio tokens:list` / `tokens:validate` / `tokens:export`

List, validate, and export design tokens. See root README for full details.

### `grimorio mcp:serve`

Starts the MCP server — the AI-friendly entry point. Exposes 16 tools, 2 resources, and 4 prompts.

## Configuration

`grimorio.config.ts`:

```ts
export default {
  specs: "./specs/**/*.json",
  tokens: "./tokens.json",
  components: "./src/components/**/*.{tsx,vue}",
  validation: {
    level: "standard",
  },
  figma: {
    // token: 'figd_...',
  },
};
```

## Programmatic API

The package exports `defineConfig` for type-safe configuration:

```ts
import { defineConfig } from "grimorio";

export default defineConfig({
  specs: "./specs/**/*.json",
});
```

## Dependencies

- `citty` — CLI framework
- `c12` — Configuration loading
- `consola` — Logging
- `tinyglobby` — File globbing
- `grimorio-core`, `grimorio-analyzers`, `grimorio-validators`, `grimorio-mcp`

## Structure

```
src/
├── commands/
│   ├── init.ts              # grimorio init
│   ├── add.ts               # grimorio add (with preset auto-detect)
│   ├── spec-infer.ts        # grimorio spec:infer
│   ├── validate.ts          # grimorio validate (with --watch)
│   ├── figma-import.ts      # grimorio figma:import
│   ├── figma-validate.ts    # grimorio figma:validate
│   ├── tokens-list.ts       # grimorio tokens:list
│   ├── tokens-validate.ts   # grimorio tokens:validate (with --watch)
│   ├── tokens-export.ts     # grimorio tokens:export
│   └── mcp-serve.ts         # grimorio mcp:serve
├── figma/
│   ├── client.ts            # Figma REST API client + URL parser
│   └── mapper.ts            # Figma properties → ComponentSpec mapper
├── utils/
│   ├── formatting.ts        # Validation result formatting
│   ├── tokens.ts            # Token path resolution
│   └── glob.ts              # File pattern matching
├── config.ts                # GrimorioConfig type + c12 loader
├── main.ts                  # CLI entry point (citty)
└── index.ts                 # Public API (defineConfig)
```
