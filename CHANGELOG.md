# Changelog

All notable changes to this project will be documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

## [0.1.0] - 2026-03-06

### Changed

- **Breaking**: Replaced `tokens: string[]` with `tokenMapping: Record<string, string>` mapping `part.property[:state][variant=value]` → `{token.path}` (W3C DTCG reference syntax)
- **Breaking**: Replaced `parts: string[]` with `anatomy: Array<{name, description?, required}>` for richer component part descriptions
- **Breaking**: Added `states: string[]` field for explicit interactive states (hover, focus, active, disabled, etc.)
- **Breaking**: Added `events: Array<{name, description?}>` field, separating event handlers from props
- **Breaking**: Issue code `MISSING_PART` renamed to `MISSING_ANATOMY_PART` in validators
- `compareSpecs()` now diffs 7 categories: props, variants, tokenMapping, slots, anatomy, states, events (was: props, variants, tokens, slots)
- All 10 built-in presets updated with rich anatomy, tokenMapping, states, and events
- Figma import now builds structured `tokenMapping` (part.cssProperty → {token.path}) instead of flat token arrays
- `get_component_guidelines` MCP tool sections updated: Token Mapping, States, Events, Anatomy replace Design Tokens and Compound Parts

### Added

- Initial monorepo setup with 5 packages: core, analyzers, validators, mcp, cli
- Component spec schemas (Zod) and W3C Design Token schemas
- 10 built-in component presets (button, input, select, checkbox, etc.)
- Default token set with 13 W3C DTCG categories
- Token exporters: CSS, SCSS, JS, Tailwind
- Multi-theme CSS export (`exportCssThemed()`)
- Token reference resolution with composite type support
- React (oxc-parser) and Vue (@vue/compiler-sfc) static analyzers
- Three-level validation (basic/standard/strict) for structure, tokens, accessibility
- MCP server with 16 tools, 2 resources, and 4 prompts (skills)
- MCP action tools: init_project, add_component, infer_spec, validate_component, validate_tokens, export_tokens, update_spec, import_from_figma, validate_figma
- MCP prompts: enrich-spec, generate-component, review-system, audit-accessibility
- CLI with 10 commands: init, spec:infer, validate, add, figma:import, figma:validate, mcp:serve, tokens:list, tokens:validate, tokens:export
- `compareSpecs()` in core for structured spec-vs-spec diffing
- CLI command `figma:validate` to compare a Figma component against an existing spec
- MCP tool `validate_figma` for Figma-to-spec validation via AI clients
- Watch mode for validate and tokens:validate
- Config via c12 with Zod validation
- JSON Schema generation for ComponentSpec
- Documentation site with VitePress (English + Spanish)
- GitHub Pages deployment workflow with path-based triggers

### Removed

- `packages/ai` — AI adapters removed in favor of AI-friendly MCP architecture where the client's AI provides reasoning
- CLI commands `enrich` and `generate` — replaced by MCP prompts that work with any AI client
- `config.ai` — no longer needed since grimorio doesn't integrate AI directly
