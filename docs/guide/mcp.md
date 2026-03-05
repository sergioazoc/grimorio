---
title: MCP Server
---

# MCP Server

grimorio includes an MCP (Model Context Protocol) server that exposes your design system to AI assistants. The server itself does not use AI -- it provides structured access to your specs, tokens, validation, and action tools.

## Starting the server

```bash
grimorio mcp:serve
```

The server communicates over stdio, following the MCP protocol.

## Tools (16)

### Read tools

| Tool                       | Description                                                                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `list_components`          | Lists all component specs in the project                                                                                                    |
| `get_component`            | Returns the full spec for a named component                                                                                                 |
| `get_component_source`     | Returns the source code of a component                                                                                                      |
| `get_tokens`               | Returns design tokens, with optional filtering by `prefix` and `$type`. Includes `$type`, `$description`, and `$deprecated` in the response |
| `validate_usage`           | Validates component usage against its spec. Returns actionable `suggestion` per issue                                                       |
| `find_component`           | Searches for components matching a query                                                                                                    |
| `get_component_guidelines` | Returns guidelines as a markdown checklist                                                                                                  |

### Action tools

| Tool                 | Description                                                       |
| -------------------- | ----------------------------------------------------------------- |
| `init_project`       | Initialize grimorio in a project (config, specs dir, tokens)      |
| `add_component`      | Add a component spec from a preset or skeleton                    |
| `infer_spec`         | Infer a component spec from source code via static analysis       |
| `validate_component` | Validate a component file against its spec (reads file from disk) |
| `validate_tokens`    | Validate tokens schema + cross-reference with specs               |
| `export_tokens`      | Export tokens to CSS, SCSS, JS, or Tailwind format                |
| `update_spec`        | Create or update a component spec (validates before writing)      |
| `import_from_figma`  | Import a component spec from a Figma file URL                     |
| `validate_figma`     | Validate a Figma component against an existing spec               |

## Prompts / Skills (4)

Pre-built workflows that AI clients can follow using grimorio tools:

| Prompt                | Description                                                       |
| --------------------- | ----------------------------------------------------------------- |
| `enrich-spec`         | Enrich a spec with accessibility, tokens, and guidelines          |
| `generate-component`  | Generate component code from a spec                               |
| `review-system`       | Review overall design system health                               |
| `audit-accessibility` | Audit a component's accessibility against WAI-ARIA best practices |

Prompts contain domain knowledge (what makes a good spec, a11y patterns, token mapping). The AI client reads the prompt and uses grimorio tools to execute the workflow.

## Resources (2)

| Resource                 | Description                                                    |
| ------------------------ | -------------------------------------------------------------- |
| `design-system-overview` | Overview of the design system -- components, tokens, structure |
| `implementation-guide`   | System prompt for AI agents implementing components            |

## Client configuration

The MCP server works with any MCP-compatible client. The configuration is the same for all -- use `npx` to run grimorio from your project's local dependency:

### Claude Desktop / Claude Code / Cursor / Windsurf

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

::: info
The MCP server reads your `grimorio.config.ts` to find specs and tokens. Make sure the config is set up before starting the server. Run `npx grimorio init` if you haven't already.
:::

## Use cases

The MCP server enables AI assistants to:

- **Enrich specs** -- add accessibility, guidelines, and token mapping via the `enrich-spec` prompt
- **Generate components** -- create code from specs via the `generate-component` prompt
- **Review system health** -- audit the overall design system via the `review-system` prompt
- **Audit accessibility** -- check a component against WAI-ARIA via the `audit-accessibility` prompt
- **Look up specs and tokens** -- query component specs and design tokens inline
- **Validate code** -- check that implementations match their specs

Since the server exposes deterministic data and tools, it acts as a bridge between your design system and AI clients without introducing AI-specific logic.

## Related pages

- [AI-Friendly Workflows](/guide/ai) -- how prompts and tools work together
- [Getting Started](/guide/getting-started) -- project setup
- [Component Specs](/guide/component-specs) -- the spec format exposed by the server
- [Design Tokens](/guide/design-tokens) -- the token data served by `get_tokens`
- [Configuration Reference](/reference/configuration) -- config file format
