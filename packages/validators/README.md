# grimorio-validators

Validates an `AnalyzedComponent` (from `grimorio-analyzers`) against a `ComponentSpec` (from `grimorio-core`). Deterministic, no AI.

## What it provides

### `validate(analysis, spec, tokens?, level?)`

Runs all three sub-validators and returns a combined result:

```ts
import { validate } from "grimorio-validators";

const result = validate(analysis, spec, tokens, "standard");
// result.valid          → true/false (no errors = valid)
// result.issues         → [{ code, severity, message, expected?, actual? }]
// result.componentName  → "Button"
// result.level          → "standard"
```

### Validation levels

| Level      | Structure                                      | Tokens                                   | Accessibility                                                             |
| ---------- | ---------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------- |
| `basic`    | Required props (error)                         | —                                        | Role (error)                                                              |
| `standard` | + Variants (warning)                           | Hardcoded values (warning)               | + ARIA attrs, keyboard handlers (warning)                                 |
| `strict`   | + Extra props/variants (info), parts (warning) | + Token existence in tokens.json (error) | + All keyboard interactions (error), interactive without keyboard (error) |

### Sub-validators

Each can be used independently:

```ts
import { validateStructure, validateTokens, validateAccessibility } from "grimorio-validators";

const structureIssues = validateStructure(analysis, spec, "strict");
const tokenIssues = validateTokens(analysis, spec, tokens, "standard");
const a11yIssues = validateAccessibility(analysis, spec, "standard");
```

### Issue codes

**Structure**: `MISSING_PROP`, `EXTRA_PROP`, `MISSING_VARIANT`, `EXTRA_VARIANT`, `MISSING_ANATOMY_PART`

**Tokens**: `HARDCODED_VALUE`, `NON_TOKENIZED_CLASS`, `MISSING_TOKEN`

**Accessibility**: `MISSING_ROLE`, `MISSING_ARIA_ATTR`, `MISSING_KEYBOARD_HANDLER`, `INTERACTIVE_WITHOUT_KEYBOARD`

## Dependencies

- `grimorio-core` — ComponentSpec, token types
- `grimorio-analyzers` — AnalyzedComponent type

## Structure

```
src/
├── types.ts                    # ValidationLevel, ValidationIssue, ValidationResult
├── validate.ts                 # Main orchestrator
├── validate-structure.ts       # Props, variants, parts
├── validate-tokens.ts          # Hardcoded values, token references
├── validate-accessibility.ts   # Role, ARIA, keyboard
└── index.ts                    # Barrel export
```
