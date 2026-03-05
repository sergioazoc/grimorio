---
title: What is grimorio?
---

# What is grimorio?

grimorio is the place where design system agreements are defined -- and the tooling to enforce them on both sides (design and development).

It bridges the gap between design and development by using **component specs** as a shared contract. Specs define what a component is -- its props, variants, token mappings, anatomy, accessibility requirements, and guidelines -- and grimorio validates that both code and design stay consistent with that contract.

grimorio supports React and Vue components.

## Philosophy

grimorio is built on three core principles.

### AI-Optional

The core workflow -- defining specs, inferring them from code, and validating implementations -- is fully deterministic, based on static analysis and rule-based validation. No API key is needed for any grimorio command.

AI reasoning comes from external clients (Claude, Cursor, Windsurf) via the [MCP server](/guide/mcp), not from grimorio itself. This means you can use grimorio without any AI, or connect it to your preferred AI client for enrichment, code generation, and accessibility audits.

### Spec as Contract

The component spec is the source of truth. Not Figma. Not code. Both sides validate against it. This ensures that design intent and implementation stay aligned through a single, version-controlled artifact.

### Progressive Adoption

A team can start with `init` + `add` + `validate` (no API key required) and add AI-assisted workflows later by connecting the MCP server. There is no lock-in to any AI provider, and the deterministic tools cover the majority of daily workflows.

## Two ways to use grimorio

grimorio has two interfaces that share the same engine but serve different purposes. For a detailed comparison, see [AI-Friendly Workflows](/guide/ai).

### MCP Server -- for interactive development with AI

Connect the MCP server to your AI client (Claude, Cursor, Windsurf, etc.) and the AI gets structured access to your entire design system. This is the recommended workflow when you are working with an AI assistant.

The AI can enrich specs with accessibility, generate components from specs, audit your design system, validate code, and answer questions about your tokens and components. grimorio provides the data and tools; the AI provides the reasoning.

```bash
npx grimorio mcp:serve
```

The server exposes **16 tools**, **4 prompts**, and **2 resources**. See [MCP Server](/guide/mcp) for setup.

### CLI -- for automation, CI/CD, and standalone use

All grimorio commands are deterministic and work without any API key. Use the CLI when you are automating tasks, running validation in CI, exporting tokens for your build pipeline, or simply prefer working without AI.

```bash
npx grimorio validate --level strict # validate in CI
npx grimorio tokens:export css       # export for build pipeline
npx grimorio figma:import <url>      # import from Figma
npx grimorio add Button              # create spec from preset
npx grimorio validate --watch        # watch mode during dev
```

See [CLI Reference](/reference/cli) for all 10 commands.

::: tip When to use which?
**Working with an AI assistant?** Use MCP -- it can do everything the CLI does, plus reason about your design system. **Automating or scripting?** Use the CLI -- it's deterministic and CI-friendly. See the [full comparison](/guide/ai) for details.
:::

## Architecture

grimorio is a pnpm monorepo with 5 ESM-only packages. The dependency graph:

```
core
├── analyzers (depends on core)
│   └── validators (depends on core, analyzers)
├── mcp (depends on core, analyzers, validators)
└── cli (depends on all packages — the only public package)
```

### Package overview

| Package        | Purpose                                                                                                                                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **core**       | Zod schemas for ComponentSpec and W3C Design Tokens, file loaders, Result type, JSON Schema generation, built-in presets (10 components), token presets (13 categories), token exporters (CSS, SCSS, JS, Tailwind) |
| **analyzers**  | Static analysis of React (oxc-parser) and Vue (@vue/compiler-sfc) components. Extracts props, cva() variants, Tailwind classes, accessibility attributes, imports/exports                                          |
| **validators** | Validates analyzed components against specs at three levels (basic, standard, strict). Sub-validators for structure, tokens, and accessibility                                                                     |
| **mcp**        | MCP server exposing 16 tools, 4 prompts, and 2 resources for AI assistant integration                                                                                                                              |
| **cli**        | The public-facing CLI (`grimorio`). 10 commands, config via `grimorio.config.ts`                                                                                                                                   |

## What comes next

- [Getting Started](/guide/getting-started) -- install grimorio and set up your first project
- [Component Specs](/guide/component-specs) -- understand the spec format
- [Design Tokens](/guide/design-tokens) -- W3C DTCG token support
- [MCP Server](/guide/mcp) -- expose your design system to AI assistants
- [CLI Reference](/reference/cli) -- all commands and options
