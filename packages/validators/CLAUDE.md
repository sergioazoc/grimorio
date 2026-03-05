# CLAUDE.md — grimorio-validators

Validates `AnalyzedComponent` against `ComponentSpec`. Deterministic, no AI. Three sub-validators orchestrated by `validate()`.

## Key APIs

```ts
validate(analysis, spec, tokens?, level?) → ValidationResult
validateStructure(analysis, spec, level?) → ValidationIssue[]
validateTokens(analysis, spec, tokens?, level?) → ValidationIssue[]
validateAccessibility(analysis, spec, level?) → ValidationIssue[]
```

## ValidationResult

```ts
{
  valid: boolean,        // true only if NO issues with severity "error"
  issues: ValidationIssue[],
  componentName: string,
  level: ValidationLevel,
}
```

`valid = true` means zero errors. Warnings and infos don't invalidate.

## Validation levels — what each checks

| Check                                    | basic | standard | strict  |
| ---------------------------------------- | ----- | -------- | ------- |
| Required props missing                   | error | error    | error   |
| Variant values missing                   | —     | warning  | warning |
| Extra props not in spec                  | —     | —        | info    |
| Extra variants not in spec               | —     | —        | info    |
| Missing anatomy parts (required)         | —     | —        | warning |
| Hardcoded color/spacing values           | —     | warning  | warning |
| Token ref doesn't exist in tokens.json   | —     | —        | error   |
| Missing role                             | error | error    | error   |
| Missing ARIA attrs                       | —     | warning  | warning |
| No keyboard handler (when spec requires) | —     | warning  | error   |
| Interactive element without keyboard     | —     | —        | error   |

## Issue codes

**Structure**: `MISSING_PROP`, `EXTRA_PROP`, `MISSING_VARIANT`, `EXTRA_VARIANT`, `MISSING_ANATOMY_PART`

**Tokens**: `HARDCODED_VALUE`, `NON_TOKENIZED_CLASS`, `MISSING_TOKEN`

**Accessibility**: `MISSING_ROLE`, `MISSING_ARIA_ATTR`, `MISSING_KEYBOARD_HANDLER`, `INTERACTIVE_WITHOUT_KEYBOARD`

## Hardcoded value detection

Regex patterns in `validate-tokens.ts` check Tailwind classes for:

- `bg-[#hex]`, `text-[#hex]`, `border-[#hex]`
- `bg-[rgb(...]`, `text-[rgb(...)]`
- `[Npx]`, `[Nrem]` arbitrary values

## Key behaviors

- `validate()` just combines issues from all three sub-validators — no logic of its own.
- `validateAccessibility` returns empty array if `spec.accessibility` is undefined.
- `validateTokens` returns empty at `basic` level.
- Token existence check (`MISSING_TOKEN`) only runs at `strict` AND requires `tokens` parameter. Extracts token paths from `spec.tokenMapping` values (strips `{` `}`).
- Interactive roles checked: button, link, checkbox, radio, tab, menuitem, switch.
- Keyboard handler names checked: `onKeyDown`, `onKeyUp`, `onKeyPress`.

## Testing patterns

- Factory helpers: `makeSpec(overrides)`, `makeAnalysis(overrides)` for building test fixtures.
- Filter by issue code: `issues.find(i => i.code === "MISSING_PROP")`.
- Test each level separately by passing level arg.

## Deps

- `grimorio-core` — ComponentSpec, TokenGroup, resolveTokenReference
- `grimorio-analyzers` — AnalyzedComponent type
