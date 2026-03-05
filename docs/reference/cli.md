---
title: CLI Commands
---

# CLI Commands

Complete reference for all `grimorio` CLI commands.

## init

Scaffolds the configuration file, specs directory, and an example tokens file.

```bash
grimorio init
```

Creates:

- `grimorio.config.ts` -- project configuration
- `specs/` -- directory for component specs
- `tokens.json` -- default token set (13 W3C DTCG categories)

---

## spec:infer

Analyzes a component file and generates a JSON spec from it using static analysis.

```bash
grimorio spec:infer <file>
```

**Examples:**

```bash
grimorio spec:infer src/components/Button.tsx
grimorio spec:infer src/components/Modal.vue -o specs/modal.json
```

Extracts: props, variants (cva), accessibility attributes, Tailwind classes, and dependencies.

| Option         | Description                   |
| -------------- | ----------------------------- |
| `--output, -o` | Output path for the spec file |

---

## add

Creates a component spec. If the name matches a built-in preset, generates a complete spec. Otherwise, creates an improved skeleton with accessibility defaults.

```bash
grimorio add <name>
```

**Examples:**

```bash
grimorio add Button                         # uses built-in preset
grimorio add Select -d "Country picker"     # preset + custom description
grimorio add CustomWidget                   # improved skeleton
grimorio add Dialog -p dialog               # explicit preset
grimorio add --list-presets                  # list available presets
```

Built-in presets: button, input, select, checkbox, dialog, card, avatar, badge, tabs, textarea.

| Option              | Description                     |
| ------------------- | ------------------------------- |
| `--preset, -p`      | Use a specific preset           |
| `--description, -d` | Component description           |
| `--category, -c`    | Component category              |
| `--list-presets`    | List available presets and exit |

---

## validate

Validates all components against their specs and design tokens.

```bash
grimorio validate
```

**Examples:**

```bash
grimorio validate
grimorio validate --level strict
grimorio validate --watch
grimorio validate --watch --level strict
```

| Option    | Description                                                  |
| --------- | ------------------------------------------------------------ |
| `--level` | Validation level: `basic`, `standard` (default), or `strict` |
| `--watch` | Re-validate on file changes (300ms debounce)                 |

**Validation levels:**

| Level      | Checks                                                           |
| ---------- | ---------------------------------------------------------------- |
| `basic`    | Required props                                                   |
| `standard` | + variants, hardcoded token values, ARIA attributes              |
| `strict`   | + extra props/variants, anatomy parts, all keyboard interactions |

Exits with code 1 if any validation errors are found.

---

## figma:import

Imports component specs from Figma. Maps Figma component properties to props, variants, slots, token mappings, anatomy, states, and events deterministically.

```bash
grimorio figma:import <url>
```

**Examples:**

```bash
grimorio figma:import "https://figma.com/design/ABC/..." --component Button
grimorio figma:import "https://figma.com/design/ABC/..."
grimorio figma:import "https://figma.com/design/ABC/...?node-id=1-234"
```

| Option         | Description                                    |
| -------------- | ---------------------------------------------- |
| `--component`  | Component name to find in the file             |
| `--token`      | Figma API token (or set `FIGMA_TOKEN` env var) |
| `--output, -o` | Output path for the spec                       |

**Mapping rules:**

| Figma property  | Spec field           |
| --------------- | -------------------- |
| `VARIANT`       | `variants` + `props` |
| `BOOLEAN`       | `props` (boolean)    |
| `TEXT`          | `props` (string)     |
| `INSTANCE_SWAP` | `slots`              |
| Bound variables | `tokenMapping`       |

---

## figma:validate

Validates a Figma component against an existing spec. Reports differences in props, variants, token mappings, slots, anatomy, states, and events.

```bash
grimorio figma:validate <url>
```

**Examples:**

```bash
grimorio figma:validate "https://figma.com/design/ABC/..." --component Button
grimorio figma:validate "https://figma.com/design/ABC/..." --component Button --json
```

| Option        | Description                                    |
| ------------- | ---------------------------------------------- |
| `--component` | Component name to validate                     |
| `--token`     | Figma API token (or set `FIGMA_TOKEN` env var) |
| `--json`      | Output as JSON                                 |

Exits with code 1 if differences are found.

---

## tokens:list

Lists design tokens from your tokens file.

```bash
grimorio tokens:list
```

**Examples:**

```bash
grimorio tokens:list                    # tree view (default)
grimorio tokens:list --flat             # flat list with full paths
grimorio tokens:list --type color       # filter by $type
grimorio tokens:list --json             # output as JSON
grimorio tokens:list --json --flat      # flat JSON
grimorio tokens:list --theme dark       # list a specific theme
```

| Option    | Description                                    |
| --------- | ---------------------------------------------- |
| `--flat`  | Show flat list instead of tree                 |
| `--type`  | Filter by `$type` (e.g., `color`, `dimension`) |
| `--json`  | Output as JSON                                 |
| `--theme` | Theme to list (multi-theme configs)            |

---

## tokens:validate

Validates tokens against the W3C DTCG schema and cross-references with component specs.

```bash
grimorio tokens:validate
```

**Examples:**

```bash
grimorio tokens:validate
grimorio tokens:validate --watch
```

| Option    | Description                                  |
| --------- | -------------------------------------------- |
| `--watch` | Re-validate on file changes (300ms debounce) |

**Checks performed:**

1. **Schema validation** -- validates against `TokenFileSchema`
2. **Statistics** -- counts tokens by `$type`, reports deprecated tokens
3. **Cross-reference** -- missing (error), deprecated used (warning), orphans (info)

Exits with code 1 if schema errors or missing tokens are found. Multi-theme configs validate all themes.

---

## tokens:export

Exports design tokens to CSS, SCSS, JS, or Tailwind format.

```bash
grimorio tokens:export <format>
```

**Examples:**

```bash
grimorio tokens:export css
grimorio tokens:export scss --prefix ds
grimorio tokens:export js --no-descriptions
grimorio tokens:export tailwind -o tailwind.tokens.js
grimorio tokens:export css --theme dark
```

| Option              | Description                        |
| ------------------- | ---------------------------------- |
| `--output, -o`      | Output file path (default: stdout) |
| `--prefix`          | Prefix for CSS/SCSS variable names |
| `--no-descriptions` | Omit description comments          |
| `--theme`           | Export a specific theme            |

**Formats:**

| Format     | Output                              | Example                              |
| ---------- | ----------------------------------- | ------------------------------------ |
| `css`      | CSS custom properties in `:root {}` | `--color-primary: #3b82f6;`          |
| `scss`     | SCSS variables                      | `$color-primary: #3b82f6;`           |
| `js`       | ES module exports                   | `export const colorPrimary = "...";` |
| `tailwind` | Tailwind `theme.extend` config      | `colors: { primary: "..." }`         |

---

## mcp:serve

Starts an MCP server over stdio for AI assistant integration.

```bash
grimorio mcp:serve
```

Exposes 16 tools, 4 prompts, and 2 resources. See [MCP Server](/guide/mcp) for details and client configuration.
