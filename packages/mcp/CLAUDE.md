# CLAUDE.md — grimorio-mcp

MCP server exposing design system specs, tokens, and actions to AI assistants. This is the **AI-friendly entry point** for grimorio. Deterministic — no AI inside.

## Key APIs

```ts
createMcpServer(config?: McpServerConfig) → McpServer
startServer(config?: McpServerConfig) → Promise<void>  // connects to stdio

McpServerConfig = { specs?: string, tokens?: string, components?: string, validation?: { level? } }
```

## Tools (16)

### Read tools (7)

| Tool                       | Params                                | Returns                                                                                          |
| -------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `list_components`          | `{ category?: string }`               | Array of `{ name, category, complexity, propsCount, variantsCount }`                             |
| `get_component`            | `{ name: string }`                    | Full ComponentSpec JSON                                                                          |
| `get_component_source`     | `{ path: string }`                    | File contents (reads from disk)                                                                  |
| `get_tokens`               | `{ prefix?: string, type?: string }`  | Flattened token map with `$type`/`$description`/`$deprecated`, filtered by prefix and/or `$type` |
| `validate_usage`           | `{ code, componentName, framework? }` | `{ valid, issueCount, issues[] }` with suggestions                                               |
| `find_component`           | `{ query: string }`                   | Matches by name, description, category, guidelines                                               |
| `get_component_guidelines` | `{ name: string }`                    | Markdown checklist for implementation                                                            |

### Action tools (8)

| Tool                 | Params                                                   | Returns / Side Effect                                                         |
| -------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `init_project`       | `{ path? }`                                              | Creates config, specs dir, tokens.json                                        |
| `add_component`      | `{ name, preset?, category?, description? }`             | Creates spec from preset or skeleton                                          |
| `infer_spec`         | `{ file, output? }`                                      | Analyzes component source → writes spec JSON                                  |
| `validate_component` | `{ file, level? }`                                       | Reads file, analyzes, validates against spec → issues with suggestions        |
| `validate_tokens`    | `{ tokensPath? }`                                        | Schema validation + cross-reference with specs → missing/deprecated/orphans   |
| `export_tokens`      | `{ format, tokensPath?, prefix?, includeDescriptions? }` | Exports tokens to CSS/SCSS/JS/Tailwind                                        |
| `update_spec`        | `{ name, spec }`                                         | Validates and writes a ComponentSpec JSON                                     |
| `import_from_figma`  | `{ url, component? }`                                    | Imports component from Figma API → writes spec (requires FIGMA_TOKEN env var) |
| `validate_figma`     | `{ url, component? }`                                    | Validates Figma component against existing spec → structured diff report      |

## Resources (2)

| Resource                 | URI                                             |
| ------------------------ | ----------------------------------------------- |
| `design-system-overview` | `grimorio://design-system/overview`             |
| `implementation-guide`   | `grimorio://design-system/implementation-guide` |

## Prompts / Skills (4)

| Prompt                | Params                                | Description                                                  |
| --------------------- | ------------------------------------- | ------------------------------------------------------------ |
| `enrich-spec`         | `componentName`                       | Instructions to enrich a spec with a11y, tokens, guidelines  |
| `generate-component`  | `componentName, framework?, styling?` | Instructions to generate code from spec                      |
| `review-system`       | (none)                                | Instructions to review overall design system health          |
| `audit-accessibility` | `componentName`                       | Instructions to audit a component's accessibility (WAI-ARIA) |

Prompts contain domain knowledge (what makes a good spec, a11y patterns, token mapping). The AI client reads the prompt and uses grimorio tools to execute the workflow.

## MCP SDK patterns

```ts
// Tool registration
server.tool("tool_name", "Description", { param: z.string() }, async ({ param }) => {
  return { content: [{ type: "text" as const, text: JSON.stringify(result) }] };
});

// Resource registration
server.resource("name", "grimorio://uri", async () => {
  return { contents: [{ uri: "grimorio://uri", mimeType: "text/markdown", text: markdown }] };
});

// Prompt registration
server.prompt("name", "Description", { arg: z.string() }, ({ arg }) => ({
  messages: [{ role: "user", content: { type: "text", text: "..." } }],
}));
```

## Tool internals

- **Spec loading**: Tools strip glob suffix from `config.specs` path (`"specs/**/*.json"` → `"specs"`) then call `loadAllSpecs()`.
- **validate_usage**: Analyzes code with `analyzeReactFile`/`analyzeVueFile`, runs `validate()`, enriches each issue with `getSuggestion(issue)` mapping IssueCode → actionable fix string.
- **validate_component**: Reads file from disk, analyzes, matches to spec by name (case-insensitive), validates at specified level.
- **validate_tokens**: Schema validation + cross-reference with specs. Reports missing (error), deprecated used (warning), orphans (info).
- **import_from_figma**: Self-contained Figma client.
- **validate_figma**: Self-contained Figma client. Fetches Figma, maps to spec, loads repo spec, runs `compareSpecs()` from core. Returns `SpecDiffResult` JSON. Parses URL, fetches file + variables, maps deterministically to spec.
- **update_spec**: Validates with `ComponentSpecSchema.safeParse()` before writing. Use this to save enriched or modified specs.
- **find_component**: Case-insensitive search across `name`, `description`, `category`, and `guidelines[]`.
- **get_component_guidelines**: Generates markdown sections: Required Props, Optional Props, Variants, Accessibility Checklist, Token Mapping, States, Events, Slots, Anatomy, Usage Guidelines. Uses `- [ ]` checkboxes.
- **get_tokens**: Propagates `$type` from parent group to child tokens. Returns `$value`, `$type`, `$description`, `$deprecated` per token.
- **implementation-guide**: System prompt for AI agents with rules, component table, token list grouped by category, and a 5-step workflow.

## Testing gotchas

- **MCP SDK doesn't expose tool handlers** — can't call handlers directly in tests.
- Tests verify: server instantiation, fixture validity, and search/filter logic by replicating conditions from tool source code.
- Fixture pattern: `beforeAll` creates temp dir `__test_fixtures_*__` with JSON specs, `afterAll` removes it.

## Deps

- `@modelcontextprotocol/sdk` — MCP protocol
- `grimorio-core` — spec/token loading, presets, exporters
- `grimorio-analyzers` — static analysis for validate_usage, validate_component, infer_spec
- `grimorio-validators` — validation engine
- `zod` — tool/prompt parameter schemas
