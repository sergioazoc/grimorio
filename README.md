# grimorio

**The place where design system agreements are defined** — and the tooling to enforce them on both sides.

grimorio bridges the gap between design and development by using **component specs** as a shared contract. Specs define what a component is (props, variants, token mapping, anatomy, states, events, accessibility, guidelines) and grimorio validates that both code and design stay consistent with that contract.

grimorio is **AI-friendly but AI-optional**. All functionality is exposed via MCP so any AI client (Claude, Cursor, Windsurf, etc.) can use it. But the core workflow — specs, inference, validation — is fully deterministic. No API keys required.

Supports React and Vue components.

## Install

```bash
pnpm add -D grimorio
```

## Quick Start

```bash
# Initialize in your project
npx grimorio init
```

`grimorio init` creates:

- `grimorio.config.ts` — project configuration
- `specs/` — directory for component specs
- `tokens.json` — default design tokens (13 W3C DTCG categories)

**Already have components? Infer specs from code:**

```bash
npx grimorio spec:infer src/components/Button.tsx
npx grimorio validate
```

**Starting from scratch? Define the spec first:**

```bash
npx grimorio add Button                    # auto-detects preset, generates full spec
npx grimorio add CustomWidget              # no preset → improved skeleton with a11y
```

**Importing from Figma?**

```bash
npx grimorio figma:import "https://figma.com/design/ABC/..." --component Button
```

**Want AI-assisted workflows?** Connect the MCP server to your AI client:

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

Then ask your AI: _"Enrich the Button spec with accessibility"_ or _"Generate a React component from the Card spec"_.

## Commands

### `grimorio init`

Scaffolds the configuration file, specs directory, and default tokens file.

### `grimorio spec:infer <file>`

Analyzes a component file and generates a JSON spec from it.

```bash
npx grimorio spec:infer src/components/Button.tsx
npx grimorio spec:infer src/components/Modal.vue -o specs/modal.json
```

Extracts props, variants (cva), accessibility attributes, Tailwind classes, and dependencies.

### `grimorio add <name>`

Creates a component spec. If the name matches a built-in preset (button, input, select, checkbox, dialog, card, avatar, badge, tabs, textarea), generates a complete spec with props, variants, accessibility, and guidelines. Otherwise, creates an improved skeleton.

```bash
npx grimorio add Button                         # uses built-in preset
npx grimorio add Select -d "Country picker"     # preset + custom description
npx grimorio add CustomWidget                   # improved skeleton
npx grimorio add --list-presets                  # list available presets
```

| Option              | Description                     |
| ------------------- | ------------------------------- |
| `--preset, -p`      | Use a specific preset           |
| `--description, -d` | Component description           |
| `--category, -c`    | Component category              |
| `--list-presets`    | List available presets and exit |

### `grimorio validate`

Validates all components against their specs and design tokens.

```bash
npx grimorio validate
npx grimorio validate --level strict
npx grimorio validate --watch              # re-validate on file changes
```

Validation levels:

| Level      | Checks                                                           |
| ---------- | ---------------------------------------------------------------- |
| `basic`    | Required props                                                   |
| `standard` | + variants, hardcoded token values, ARIA attributes              |
| `strict`   | + extra props/variants, anatomy parts, all keyboard interactions |

Exits with code 1 if any validation errors are found.

### `grimorio figma:import <url>`

Imports component specs from Figma. Maps Figma component properties to props, variants, slots, and token mappings deterministically (no AI).

```bash
npx grimorio figma:import "https://figma.com/design/ABC/..." --component Button
npx grimorio figma:import "https://figma.com/design/ABC/..." # lists available components
```

| Option         | Description                                    |
| -------------- | ---------------------------------------------- |
| `--component`  | Component name to find in the file             |
| `--token`      | Figma API token (or set `FIGMA_TOKEN` env var) |
| `--output, -o` | Output path for the spec                       |

### `grimorio figma:validate <url>`

Validates a Figma component against an existing spec. Reports differences in props, variants, token mappings, slots, anatomy, states, and events.

```bash
npx grimorio figma:validate "https://figma.com/design/ABC/..." --component Button
```

### `grimorio tokens:list`

Lists design tokens from your tokens file.

```bash
npx grimorio tokens:list                    # tree view (default)
npx grimorio tokens:list --flat             # flat list with full paths
npx grimorio tokens:list --type color       # filter by $type
npx grimorio tokens:list --json             # output as JSON
```

### `grimorio tokens:validate`

Validates tokens against the W3C DTCG schema and cross-references with component specs.

```bash
npx grimorio tokens:validate
npx grimorio tokens:validate --watch        # re-validate on file changes
```

### `grimorio tokens:export <format>`

Exports design tokens to CSS, SCSS, JS, or Tailwind format.

```bash
npx grimorio tokens:export css
npx grimorio tokens:export scss --prefix ds
npx grimorio tokens:export tailwind -o tailwind.tokens.js
```

### `grimorio mcp:serve`

Starts an MCP server for AI assistant integration. Exposes 16 tools, 2 resources, and 4 prompts.

```bash
npx grimorio mcp:serve
```

## MCP: AI-Friendly Design System

The MCP server is the AI-friendly entry point for grimorio. Connect it to any MCP-compatible client and get full access to your design system.

**Tools (16):** Read specs, tokens, source code. Validate components. Add specs from presets. Infer specs from code. Import from Figma. Validate Figma against specs. Export tokens.

**Prompts (4):** Pre-built workflows for enriching specs, generating components, reviewing system health, and auditing accessibility. The AI client follows the instructions and uses grimorio tools to execute.

**Resources (2):** Design system overview and implementation guide.

See [packages/mcp/README.md](packages/mcp/README.md) for full details.

## Configuration

`grimorio.config.ts` at the project root:

```ts
export default {
  specs: "./specs/**/*.json",
  tokens: "./tokens.json",
  components: "./src/components/**/*.{tsx,vue}",
  validation: {
    level: "standard",
  },
  figma: {
    // token: 'figd_...', // or set FIGMA_TOKEN env var
  },
};
```

### Multi-theme tokens

```ts
export default {
  tokens: {
    default: "./tokens.json",
    dark: "./tokens-dark.json",
  },
};
```

## Philosophy: AI-friendly, AI-optional

grimorio exposes everything via MCP so AI clients can use it, but never requires AI. No API keys, no AI adapters, no SDK dependencies.

| Operation        | AI?     | How                                                |
| ---------------- | ------- | -------------------------------------------------- |
| `init`, `add`    | No      | Scaffolding, templates, built-in presets           |
| `spec:infer`     | No      | Static analysis (oxc-parser, @vue/compiler-sfc)    |
| `validate`       | No      | Deterministic rule checking                        |
| `figma:import`   | No      | Deterministic mapping from Figma properties        |
| `figma:validate` | No      | Compare Figma component against existing spec      |
| `tokens:*`       | No      | Schema validation, export, listing                 |
| `mcp:serve`      | No      | Exposes tools for external AI clients              |
| Enrich specs     | Via MCP | AI client uses `enrich-spec` prompt + tools        |
| Generate code    | Via MCP | AI client uses `generate-component` prompt + tools |

A team can start with CLI (no AI needed) and add AI-assisted workflows later by connecting the MCP server.

## License

MIT
