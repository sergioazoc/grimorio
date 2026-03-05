# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is grimorio

grimorio is the place where design system agreements are defined, and the tooling to enforce them on both sides (design and development). The **component spec** is the central contract. grimorio is **AI-friendly**: it exposes all functionality via MCP so any AI client can use it, but never requires AI to function.

## Documentation maintenance

Whenever you add, remove, or change public APIs, commands, tools, types, or package behavior, you **must** update the corresponding `CLAUDE.md` files (root + affected packages). These files are the primary reference for both humans and AI working with the codebase. Stale docs are worse than no docs.

## Changelog

Maintain `CHANGELOG.md` at the root following [Keep a Changelog](https://keepachangelog.com/) format. When making changes that affect public API, behavior, commands, or fix bugs, add an entry under `## [Unreleased]` in the appropriate section (Added, Changed, Fixed, Removed). Skip internal refactors and chores. On release, rename `[Unreleased]` to `[version] - date`.

## Design Principles

- **AI-friendly, AI-optional**: The core workflow (specs, inference, validation) works without AI. grimorio exposes everything via MCP so AI clients can use it, but never bundles AI adapters or requires API keys. The AI reasoning comes from the client, not from grimorio.
- **Spec as contract**: The spec is the source of truth, not Figma and not code. Both sides validate against it.
- **Progressive adoption**: A team can start with `init` + `add` + `validate` (CLI, no AI) and add AI-assisted workflows later by connecting the MCP server to their preferred AI client.

## After making changes

Always run these checks after making code changes, before considering the task done:

1. `pnpm lint` — fix any lint errors
2. `pnpm typecheck` — fix any type errors
3. `pnpm format` — auto-format all files

If you changed code that has tests, or if tests could be affected, also run `pnpm test`.

## Commands

```bash
pnpm build              # Build all packages (tsdown)
pnpm test               # Run all tests (vitest)
pnpm test:watch         # Run tests in watch mode
pnpm lint               # Lint with oxlint (type-aware)
pnpm fmt                # Format with oxfmt
pnpm fmt:check          # Check formatting
pnpm typecheck          # Type-check all packages with tsgo
pnpm docs:dev           # Dev server for docs (VitePress)
pnpm docs:build         # Build docs site

# Run a single test file
pnpm vitest run packages/core/src/schemas/design-tokens.test.ts

# Run tests for a single package
pnpm vitest run --project grimorio-core
```

## Architecture

pnpm monorepo with 5 ESM-only packages. Dependency graph:

```
core
├── analyzers (→ core)
│   └── validators (→ core, analyzers)
├── mcp (→ core, analyzers, validators)  ← AI-friendly entry point
└── cli (→ core, analyzers, validators, mcp)
```

**core** — Zod schemas for ComponentSpec and W3C Design Tokens, file loaders, Result type, JSON Schema generation. Built-in component presets (`packages/core/src/presets/`) with `applyPreset()`, `listPresetIds()` for 10 common components. Token presets via `getDefaultTokens()` (13 W3C DTCG categories). Token exporters (`packages/core/src/export/`) with `exportTokens(tokens, format, options?)` supporting CSS, SCSS, JS, and Tailwind formats. `exportCssThemed()` for multi-theme CSS output. `flattenWithTypes()` resolves `{token.ref}` references and supports composite types (shadow, border, transition, gradient, strokeStyle). `compareSpecs(source, target)` produces a structured diff between two ComponentSpecs (used by `figma:validate`).

**analyzers** — Static analysis of React (oxc-parser) and Vue (@vue/compiler-sfc) components. Extracts props, cva() variants, Tailwind classes, accessibility attrs, imports/exports. Returns `AnalyzedComponent`.

**validators** — Validates `AnalyzedComponent` against a `ComponentSpec` at three levels (basic/standard/strict). Three sub-validators: structure, tokens, accessibility.

**mcp** — MCP server exposing 16 tools, 2 resources, and 4 prompts. **This is the AI-friendly entry point.** Read tools: list_components, get_component, get_component_source, get_tokens, validate_usage, find_component, get_component_guidelines. Action tools: init_project, add_component, infer_spec, validate_component, validate_tokens, export_tokens, update_spec, import_from_figma, validate_figma. Prompts (skills): enrich-spec, generate-component, review-system, audit-accessibility. Resources: design-system-overview, implementation-guide.

**cli** — citty-based CLI (`grimorio`). Commands: init, spec:infer, validate, add, figma:import, figma:validate, mcp:serve, tokens:list, tokens:validate, tokens:export. Config via c12 (`grimorio.config.ts`) with Zod validation. `add` auto-detects built-in presets. `figma:import` maps Figma component properties to specs deterministically. `init` generates full default token set via `getDefaultTokens()`. `validate` and `tokens:validate` support `--watch` for continuous re-validation. Multi-theme support via `tokens: Record<string, string>` config.

## Key Patterns

- **Result<T, E>** — All loaders return `{ ok: true, value } | { ok: false, error }` instead of throwing. Defined in `packages/core/src/result.ts`.
- **oxc-parser API** — `parseSync(filename, sourceText)` where first arg is the filename. `result.program` is already a JS object. Uses `typeArguments` (not `typeParameters`).
- **Validation levels** — `basic` (required props), `standard` (+ variants, tokens, aria), `strict` (+ extras, anatomy parts, all keyboard interactions).
- **pnpm catalog** — Shared dependency versions in `pnpm-workspace.yaml` (`zod`). Single-package deps use direct versions.
- **MCP prompts as skills** — Domain knowledge (how to enrich specs, audit a11y) lives in MCP prompts, not in AI adapter code. The AI client reads and follows them.

## Build & Config

- **Bundler**: tsdown (rolldown-based). Each package has `tsdown.config.ts`. Output: `dist/index.mjs` + `dist/index.d.mts`.
- **TypeScript**: tsgo (`@typescript/native-preview`). Root tsconfig uses project references with `"files": []`. Each package sets `isolatedDeclarations: false` (Zod incompatibility).
- **Linting**: oxlint + oxlint-tsgolint for type-aware rules. `no-floating-promises` and `no-misused-promises` are errors. `no-unsafe-*` rules are off.
- **Formatting**: oxfmt. VSCode formats on save via oxc extension.
- **Testing**: Vitest 4 workspace mode with `projects: ["packages/*"]`. Each package uses `defineProject` in its `vitest.config.ts`.
- **Docs**: VitePress 1.6.4 in `docs/` (part of pnpm workspace as `grimorio-docs`). i18n: English (root) + Spanish (`/es/`). Deployed to GitHub Pages via `.github/workflows/docs.yml` (only triggers on `docs/**` changes). Excluded from `pnpm build` via filter.

## CI/CD & Release

Four GitHub Actions workflows in `.github/workflows/`:

- **ci.yml** — Runs on push to `main` and PRs to `main` or `release`. Runs build, test, lint, and format check.
- **docs.yml** — Deploys VitePress docs to GitHub Pages on push to `main` when `docs/**` changes (+ manual trigger).
- **release.yml** — Runs on push to `release`. First runs the full CI suite; then reads the version from `packages/cli/package.json`, creates a git tag `vX.Y.Z` and a GitHub Release (skips if the tag already exists).
- **publish.yml** — Triggered by a GitHub Release being published. Builds, tests, and publishes the `grimorio` package to npm.

**Release flow:**

1. Develop on `main` (CI runs on every push/PR).
2. When ready to release: bump versions in `package.json` files and update `CHANGELOG.md` on `main`.
3. Merge `main` → `release` (CI runs on the PR, then `release.yml` runs on merge).
4. `release.yml` creates the tag + GitHub Release → triggers `publish.yml` → publishes to npm.

The `release` branch is the release gate. If the version hasn't changed (tag already exists), the release job is a no-op.
