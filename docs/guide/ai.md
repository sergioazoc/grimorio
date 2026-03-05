---
title: AI-Friendly Workflows
---

# AI-Friendly Workflows

grimorio is **AI-friendly but AI-optional**. It exposes all functionality via MCP so any AI client can use it, but never requires AI to function. No API keys, no AI adapters, no SDK dependencies.

## CLI vs MCP: when to use each

grimorio has two interfaces -- the CLI and the MCP server. They share the same engine, but serve different use cases.

### Use the MCP server when...

You are **working interactively with an AI assistant** (Claude, Cursor, Windsurf, etc.). The MCP server gives the AI structured access to your entire design system. The AI can read specs, query tokens, validate code, and take actions -- all within the conversation.

This is the recommended workflow for:

- **Enriching specs** -- the AI reasons about accessibility, tokens, and guidelines, then writes the enriched spec
- **Generating components** -- the AI reads the spec, checks tokens, generates code, and validates it
- **Exploring the design system** -- the AI answers questions like "which components use `color.primary`?" or "what are the Button guidelines?"
- **Auditing** -- the AI reviews accessibility or overall system health and suggests improvements
- **Updating specs** -- the AI can create or modify specs based on your instructions

In all of these, **grimorio provides deterministic data and tools; the AI provides reasoning**. grimorio never calls an AI model internally.

### Use the CLI when...

You are **automating tasks**, running things in **CI/CD**, or working **without an AI assistant**.

This is the right choice for:

- **CI/CD validation** -- `grimorio validate` and `grimorio tokens:validate` exit with code 1 on errors
- **Token export** -- `grimorio tokens:export css` generates CSS custom properties for your build pipeline
- **Figma import** -- `grimorio figma:import` maps Figma properties to specs deterministically
- **Scaffolding** -- `grimorio init` and `grimorio add` set up projects and create specs from presets
- **Spec inference** -- `grimorio spec:infer` analyzes existing code with static analysis
- **Watch mode** -- `grimorio validate --watch` re-validates on file changes during development

All CLI commands are deterministic and need no API key.

### Side-by-side comparison

| Scenario                           | CLI                                    | MCP                                          |
| ---------------------------------- | -------------------------------------- | -------------------------------------------- |
| Validate in CI                     | `npx grimorio validate --level strict` | --                                           |
| Export tokens to CSS               | `npx grimorio tokens:export css`       | `export_tokens` tool                         |
| Import spec from Figma             | `npx grimorio figma:import <url>`      | `import_from_figma` tool                     |
| Enrich a spec with a11y            | --                                     | AI uses `enrich-spec` prompt + tools         |
| Generate component code            | --                                     | AI uses `generate-component` prompt + tools  |
| Review design system health        | --                                     | AI uses `review-system` prompt + tools       |
| Audit accessibility                | --                                     | AI uses `audit-accessibility` prompt + tools |
| "Which components use this token?" | --                                     | AI queries `get_tokens` + `list_components`  |
| Watch mode during development      | `npx grimorio validate --watch`        | --                                           |
| Create spec from preset            | `npx grimorio add Button`              | `add_component` tool                         |

The `--` cells are important: tasks that require reasoning (enrichment, generation, audits) are **only available via MCP**, because the reasoning comes from the AI client. Tasks that need no reasoning work in both, but the CLI is simpler for automation.

## How the MCP workflow works

Instead of bundling AI adapters, grimorio exposes **MCP prompts** (skills) that contain domain knowledge. Your AI client reads the prompt and uses grimorio's tools to execute the workflow.

### Example: enriching a spec

Tell your AI: _"Use the enrich-spec prompt for my Button component"_

The AI will:

1. Call `get_component("Button")` to read the current spec
2. Call `get_tokens()` to see available design tokens
3. Reason about accessibility, tokens, and guidelines
4. Call `update_spec("Button", enrichedSpec)` to save the result

### Example: generating a component

Tell your AI: _"Generate a React component from the Card spec using Tailwind"_

The AI will:

1. Call `get_component("Card")` to get the spec
2. Call `get_component_guidelines("Card")` for the checklist
3. Call `get_tokens()` for token values
4. Generate the code using its own reasoning
5. Call `validate_usage` to verify the result

## Available prompts

| Prompt                | Description                                                       |
| --------------------- | ----------------------------------------------------------------- |
| `enrich-spec`         | Enrich a spec with accessibility, tokens, and guidelines          |
| `generate-component`  | Generate component code from a spec                               |
| `review-system`       | Review overall design system health                               |
| `audit-accessibility` | Audit a component's accessibility against WAI-ARIA best practices |

## Setup

Connect the MCP server to your AI client. See [MCP Server](/guide/mcp) for configuration details.

## Related pages

- [MCP Server](/guide/mcp) -- setup, tools, and client configuration
- [Getting Started](/guide/getting-started) -- project setup
- [Component Specs](/guide/component-specs) -- the spec format
- [CLI Reference](/reference/cli) -- all commands
