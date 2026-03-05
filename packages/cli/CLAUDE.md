# CLAUDE.md — grimorio (CLI)

The only public package. Orchestrates all other packages via citty CLI commands. For AI-assisted workflows, use `mcp:serve` to expose everything via MCP.

## Commands (10)

| Command                | Description                                                    |
| ---------------------- | -------------------------------------------------------------- |
| `init`                 | Scaffolds config, specs/, tokens.json (full default token set) |
| `add <name>`           | Creates spec from preset or skeleton                           |
| `spec:infer <file>`    | Infers spec from component source                              |
| `validate`             | Validates components against specs (supports `--watch`)        |
| `figma:import <url>`   | Imports specs from Figma API                                   |
| `figma:validate <url>` | Validates Figma component against existing spec                |
| `tokens:list`          | List design tokens (tree/flat/json, filter by $type)           |
| `tokens:validate`      | Validate tokens (schema + cross-ref, supports `--watch`)       |
| `tokens:export <fmt>`  | Export tokens to css/scss/js/tailwind                          |
| `mcp:serve`            | Starts MCP server (AI-friendly entry point)                    |

## CLI framework

- **citty**: `defineCommand({ meta, args, run })`. Subcommands in `main.ts` use lazy dynamic imports.
- **c12**: `resolveConfig()` loads `grimorio.config.ts` with defaults + overrides.
- **consola**: Logging (`consola.info`, `consola.success`, `consola.error`, `consola.warn`).

## GrimorioConfig

Defined via Zod schema with `.strip()` (unknown fields silently removed). Validated in `resolveConfig()` with `safeParse` — invalid values emit `consola.warn` and fall back to defaults.

```ts
{
  specs?: string,                                    // default: "./specs/**/*.json"
  tokens?: string | Record<string, string>,          // default: "./tokens.json", multi-theme via Record
  components?: string,                               // default: "./src/components/**/*.{tsx,vue}"
  validation?: { level?: "basic" | "standard" | "strict" },
  figma?: { token?: string },
}
```

Multi-theme: `tokens: { default: "./tokens.json", dark: "./tokens-dark.json" }`. CSS export generates `:root` + `[data-theme="dark"]`. Other formats require `--theme` flag.

## Command details

### `add` — preset auto-detection

- If `name.toLowerCase()` matches a preset ID (button, input, select...), uses it automatically.
- Flags: `--preset/-p`, `--description/-d`, `--list-presets`.
- Calls `applyPreset(presetId, name, overrides)` from core.

### `figma:validate` — Figma vs spec comparison

- Same auth pattern as figma:import (--token, config, env var).
- Fetches Figma component, maps to spec via `mapFigmaToSpec()`, loads repo spec, runs `compareSpecs()` from core.
- Reports differences: missing/extra/changed props, variants, tokenMapping, slots, anatomy, states, events.
- `--json`: structured JSON output (useful for CI).
- Exit code 1 if differences found.

### `figma:import` — deterministic Figma import

- Token resolution: `--token` → `config.figma.token` → env `FIGMA_TOKEN`.
- `parseFigmaUrl()` extracts fileKey + nodeId, converts node-id dashes to colons.
- `mapFigmaToSpec()` maps: VARIANT→variants+props, BOOLEAN→bool props, TEXT→string props, INSTANCE_SWAP→slots. Returns spec with `anatomy: []`, `tokenMapping`, `states: []`, `events: []`.
- Validates generated spec with `ComponentSpecSchema.safeParse()` before writing.
- Without `--component`, lists available components in the file.

### `validate` — component validation

- Globs component files, analyzes each (React/Vue), matches to spec by name (case-insensitive).
- `--watch/-w`: re-validates on file changes (fs.watch, 300ms debounce).
- Exit code 1 if any validation errors (in non-watch mode).

### `tokens:list` — token inspection

- `--flat`: flat list instead of tree view.
- `--type <type>`: filter by `$type` (e.g., `color`, `dimension`).
- `--json`: output as JSON.
- Propagates `$type` from parent groups to child tokens.

### `tokens:validate` — token validation

- Validates `tokens.json` against `TokenFileSchema`.
- Shows statistics: total tokens, count per type, deprecated count.
- Cross-references with specs: reports **missing** (referenced but not defined → error), **deprecated used** (→ warning), **orphans** (defined but not referenced → info).
- Multi-theme configs: validates all themes.
- `--watch/-w`: re-validates on file changes (fs.watch, 300ms debounce).
- Exit code 1 if missing tokens or schema errors.

### `tokens:export` — token export

- Positional arg: format (`css`, `scss`, `js`, `tailwind`).
- `--output/-o`: write to file (default: stdout).
- `--prefix`: prefix for CSS/SCSS variable names.
- `--no-descriptions`: omit description comments.
- `--theme <name>`: export a specific theme (for multi-theme configs). CSS without `--theme` generates all themes in one file.
- Uses `exportTokens()` and `exportCssThemed()` from core.

## Figma internals (`src/figma/`)

### `client.ts`

- `createFigmaClient(token)` → `{ getFile, getVariables }`.
- REST API: `https://api.figma.com/v1`, header `X-Figma-Token`.
- `parseFigmaUrl()` handles `/design/`, `/file/`, branch URLs.

### `mapper.ts`

- `mapFigmaToSpec(name, node, ctx?)` — deterministic mapping.
- `cleanPropertyName()` — removes Figma suffixes like `#1234:5`, converts to camelCase.
- `guessCategory()` — regex-based: Button→actions, Input→forms, Dialog→feedback, etc.
- `collectTokenMappingFromNode()` — extracts from boundVariables recursively, builds `part.cssProperty` → `{token.path}` using `FIGMA_PROP_MAP`.
- `findComponentNode(root, name)` — DFS for COMPONENT/COMPONENT_SET by name.
- Complexity: props+variants ≤3 simple, 4-8 moderate, >8 complex.

## Build

- Two entry points: `src/index.ts` (public API) and `src/main.ts` (CLI).
- Bin: `bin/grimorio.mjs` → imports `dist/main.mjs`.
- Deps: c12, citty, consola, tinyglobby + all workspace packages.

## Testing patterns

- **Preset tests**: Import `applyPreset`, validate output with `ComponentSpecSchema.safeParse`.
- **Figma tests**: Factory `makeNode(overrides)` for FigmaNode fixtures. Test URL parsing edge cases extensively.
- Temp dirs: `__test_specs__`, cleaned in afterAll.

## Config gotcha

The `grimorio.config.ts` template in `init` must NOT import from `'grimorio'` — the package isn't installed in the user's project at init time. Use `export default { ... }` without import.
