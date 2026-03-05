# grimorio-mcp

MCP (Model Context Protocol) server that exposes your design system to AI assistants. This is the **AI-friendly entry point** for grimorio — no AI inside, just deterministic tools, resources, and prompts.

## What it provides

### `createMcpServer(config?)`

Creates an MCP server instance with all tools, resources, and prompts registered:

```ts
import { createMcpServer, startServer } from "grimorio-mcp";

// Programmatic usage
const server = createMcpServer({
  specs: "./specs/**/*.json",
  tokens: "./tokens.json",
  validation: { level: "standard" },
});

// Or start directly over stdio
await startServer({ specs: "./specs/**/*.json" });
```

## Tools (16)

### Read tools

| Tool                       | Description                                                                    |
| -------------------------- | ------------------------------------------------------------------------------ |
| `list_components`          | List all component specs, optionally filtered by category                      |
| `get_component`            | Get the full spec for a component by name                                      |
| `get_component_source`     | Read the source code of a component file                                       |
| `get_tokens`               | Get design tokens, optionally filtered by path prefix or $type                 |
| `validate_usage`           | Validate component code against its spec (returns issues with fix suggestions) |
| `find_component`           | Search components by name, description, category, or guidelines                |
| `get_component_guidelines` | Get a structured markdown checklist for implementing a component               |

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

| Resource                 | URI                                             | Description                                                                             |
| ------------------------ | ----------------------------------------------- | --------------------------------------------------------------------------------------- |
| `design-system-overview` | `grimorio://design-system/overview`             | Markdown summary of all components and tokens                                           |
| `implementation-guide`   | `grimorio://design-system/implementation-guide` | System prompt for AI agents with rules, component table, available tokens, and workflow |

## Usage with Claude Desktop / Claude Code / Cursor

```json
{
  "mcpServers": {
    "grimorio": {
      "command": "grimorio",
      "args": ["mcp:serve"]
    }
  }
}
```

Or with npx:

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

## Example workflows

**Enrich a spec** — tell your AI: _"Use the enrich-spec prompt for my Button component"_

The AI will:

1. `get_component("Button")` — read the current spec
2. `get_tokens()` — see available tokens
3. Reason about accessibility, tokens, guidelines
4. `update_spec("Button", enrichedSpec)` — save the result

**Generate code** — tell your AI: _"Generate a React component from the Card spec"_

**Review system health** — tell your AI: _"Review my design system"_

## Dependencies

- `@modelcontextprotocol/sdk` — MCP protocol implementation
- `grimorio-core` — Spec/token loading, presets, exporters
- `grimorio-analyzers` — Static analysis
- `grimorio-validators` — Validation engine
- `zod` — Tool/prompt parameter schemas

## Structure

```
src/
├── server.ts                              # createMcpServer, startServer
├── tools/
│   ├── list-components.ts                 # Read: list specs
│   ├── get-component.ts                   # Read: get full spec
│   ├── get-component-source.ts            # Read: file contents
│   ├── get-tokens.ts                      # Read: design tokens
│   ├── validate-usage.ts                  # Read: validate code string
│   ├── find-component.ts                  # Read: search specs
│   ├── get-component-guidelines.ts        # Read: markdown checklist
│   ├── init-project.ts                    # Action: scaffold project
│   ├── add-component.ts                   # Action: create spec
│   ├── infer-spec.ts                      # Action: analyze → spec
│   ├── validate-component.ts              # Action: validate file
│   ├── validate-tokens.ts                 # Action: validate tokens
│   ├── export-tokens.ts                   # Action: export tokens
│   ├── update-spec.ts                     # Action: save spec
│   ├── import-from-figma.ts              # Action: Figma → spec
│   └── validate-figma.ts                # Action: Figma vs spec diff
├── prompts/
│   └── index.ts                           # 4 MCP prompts (skills)
├── resources/
│   ├── design-system-overview.ts
│   └── implementation-guide.ts
└── index.ts                               # Barrel export
```
