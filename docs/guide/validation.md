---
title: Validation
---

# Validation

grimorio validates that your component implementations match their specs and that your design tokens are well-formed. Validation is fully deterministic -- no AI is involved.

## Component validation

Run validation with:

```bash
grimorio validate
```

This scans all components matched by `components` in your config, finds their corresponding specs, and checks conformance.

### Validation levels

There are three levels, each building on the previous:

| Level      | What it checks                                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `basic`    | Required props are present                                                                                                           |
| `standard` | Everything in basic, plus: variants match spec, hardcoded token values are flagged, ARIA attributes are present                      |
| `strict`   | Everything in standard, plus: extra props/variants not in spec, anatomy parts are present, all keyboard interactions are implemented |

Set the level via the CLI flag or in the config file:

```bash
grimorio validate --level strict
```

```ts
// grimorio.config.ts
export default {
  validation: {
    level: "strict",
  },
};
```

::: tip
Start with `basic` or `standard` and move to `strict` as your design system matures.
:::

### How validation works

Validation uses three sub-validators:

1. **Structure** -- checks props, variants, slots, anatomy parts, and dependencies against the spec
2. **Tokens** -- detects hardcoded values that should use design tokens
3. **Accessibility** -- verifies ARIA roles, attributes, and keyboard interactions

The exit code is `1` if any validation errors are found, making it suitable for CI pipelines.

### Watch mode

For continuous validation during development:

```bash
grimorio validate --watch
grimorio validate --watch --level strict
```

This re-runs validation automatically when spec or component files change, with a 300ms debounce.

## Token validation

Validate your design tokens separately:

```bash
grimorio tokens:validate
grimorio tokens:validate --watch
```

Token validation performs three checks:

### 1. Schema validation

Validates the token file against the W3C DTCG schema (`TokenFileSchema`). Reports structural errors in the token file.

### 2. Statistics

Counts tokens by `$type` and reports deprecated tokens. This gives you an overview of your token coverage.

### 3. Cross-reference

Compares tokens referenced in component specs against tokens defined in token files:

| Severity | Condition           | Meaning                                                         |
| -------- | ------------------- | --------------------------------------------------------------- |
| Error    | **Missing**         | Token is referenced in a spec but not defined in any token file |
| Warning  | **Deprecated used** | A deprecated token is still referenced by a spec                |
| Info     | **Orphan**          | Token is defined but not referenced by any spec                 |

::: warning
Missing tokens cause the command to exit with code 1. Fix these before shipping.
:::

### Multi-theme validation

When your config uses multiple token files, `tokens:validate` validates all themes automatically:

```ts
// grimorio.config.ts
export default {
  tokens: {
    default: "./tokens.json",
    dark: "./tokens-dark.json",
  },
};
```

Each theme is validated independently for schema conformance and cross-referenced against the same set of specs.

## CI integration

Both `validate` and `tokens:validate` exit with code 1 on errors. Add them to your CI pipeline:

```bash
grimorio validate --level standard
grimorio tokens:validate
```

## Related pages

- [Component Specs](/guide/component-specs) -- the spec format that validation checks against
- [Design Tokens](/guide/design-tokens) -- token format and export
- [CLI Reference](/reference/cli) -- all validation command options
