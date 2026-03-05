---
title: Spec Schema
---

# Spec Schema Reference

Complete reference for the `ComponentSpec` schema. All component specs are validated against this schema using Zod.

## ComponentSpec

The root object for a component spec.

| Field             | Type                                  | Required | Default      | Description                                                                                       |
| ----------------- | ------------------------------------- | -------- | ------------ | ------------------------------------------------------------------------------------------------- |
| `name`            | `string`                              | **yes**  | --           | Component name. The only required field                                                           |
| `description`     | `string`                              | no       | --           | Human-readable description                                                                        |
| `category`        | `string`                              | no       | --           | Component category (e.g., `actions`, `forms`, `feedback`, `navigation`, `data-display`, `layout`) |
| `complexity`      | `"simple" \| "moderate" \| "complex"` | no       | `"moderate"` | Complexity classification                                                                         |
| `props`           | `Prop[]`                              | no       | `[]`         | Component props                                                                                   |
| `variants`        | `Variant[]`                           | no       | `[]`         | Variant axes with allowed values                                                                  |
| `defaultVariants` | `Record<string, string>`              | no       | `{}`         | Default values for variants                                                                       |
| `slots`           | `Slot[]`                              | no       | `[]`         | Named slots                                                                                       |
| `anatomy`         | `AnatomyPart[]`                       | no       | `[]`         | Named sub-parts that make up the component                                                        |
| `tokenMapping`    | `Record<string, string>`              | no       | `{}`         | Maps `part.property[:state][variant=value]` to `{token.path}` references                          |
| `states`          | `string[]`                            | no       | `[]`         | Interactive states (hover, focus, active, disabled, etc.)                                         |
| `events`          | `Event[]`                             | no       | `[]`         | Event handlers the component emits                                                                |
| `dependencies`    | `string[]`                            | no       | `[]`         | Component dependencies                                                                            |
| `accessibility`   | `Accessibility`                       | no       | --           | Accessibility requirements                                                                        |
| `guidelines`      | `string[]`                            | no       | `[]`         | Implementation guidelines                                                                         |

## Prop

Defines a component prop.

| Field         | Type      | Required | Default | Description                                                   |
| ------------- | --------- | -------- | ------- | ------------------------------------------------------------- |
| `name`        | `string`  | **yes**  | --      | Prop name                                                     |
| `type`        | `string`  | **yes**  | --      | Prop type (e.g., `string`, `boolean`, `number`, `() => void`) |
| `required`    | `boolean` | no       | `false` | Whether the prop is required                                  |
| `default`     | `unknown` | no       | --      | Default value                                                 |
| `description` | `string`  | no       | --      | Human-readable description                                    |

**Example:**

```json
{
  "name": "variant",
  "type": "string",
  "required": false,
  "default": "primary",
  "description": "Visual style variant"
}
```

## Variant

Defines a variant axis with its allowed values.

| Field         | Type       | Required | Default | Description                     |
| ------------- | ---------- | -------- | ------- | ------------------------------- |
| `name`        | `string`   | **yes**  | --      | Variant axis name               |
| `values`      | `string[]` | **yes**  | --      | Allowed values for this variant |
| `description` | `string`   | no       | --      | Human-readable description      |

**Example:**

```json
{
  "name": "size",
  "values": ["sm", "md", "lg"],
  "description": "Controls the size of the component"
}
```

## Slot

Defines a named slot for content injection.

| Field         | Type      | Required | Default | Description                  |
| ------------- | --------- | -------- | ------- | ---------------------------- |
| `name`        | `string`  | **yes**  | --      | Slot name                    |
| `description` | `string`  | no       | --      | Human-readable description   |
| `required`    | `boolean` | no       | `false` | Whether the slot is required |

**Example:**

```json
{
  "name": "icon",
  "description": "Leading icon slot",
  "required": false
}
```

## AnatomyPart

Defines a named sub-part of the component.

| Field         | Type      | Required | Default | Description                  |
| ------------- | --------- | -------- | ------- | ---------------------------- |
| `name`        | `string`  | **yes**  | --      | Part name                    |
| `description` | `string`  | no       | --      | Human-readable description   |
| `required`    | `boolean` | no       | `true`  | Whether the part is required |

**Example:**

```json
{
  "name": "root",
  "description": "Outer wrapper element",
  "required": true
}
```

## Event

Defines an event handler that the component emits.

| Field         | Type     | Required | Default | Description                |
| ------------- | -------- | -------- | ------- | -------------------------- |
| `name`        | `string` | **yes**  | --      | Event name                 |
| `description` | `string` | no       | --      | Human-readable description |

**Example:**

```json
{
  "name": "onClick",
  "description": "Fired when the component is clicked"
}
```

## Accessibility

Defines accessibility requirements.

| Field                  | Type                    | Required | Default | Description                                     |
| ---------------------- | ----------------------- | -------- | ------- | ----------------------------------------------- |
| `role`                 | `string`                | no       | --      | ARIA role (e.g., `button`, `dialog`, `tablist`) |
| `ariaAttributes`       | `string[]`              | no       | `[]`    | Required ARIA attributes                        |
| `keyboardInteractions` | `KeyboardInteraction[]` | no       | `[]`    | Expected keyboard interactions                  |

### KeyboardInteraction

| Field         | Type     | Required | Description                                              |
| ------------- | -------- | -------- | -------------------------------------------------------- |
| `key`         | `string` | **yes**  | Key name (e.g., `Enter`, `Space`, `Escape`, `ArrowDown`) |
| `description` | `string` | **yes**  | What the key does                                        |

**Example:**

```json
{
  "role": "dialog",
  "ariaAttributes": ["aria-modal", "aria-labelledby"],
  "keyboardInteractions": [
    { "key": "Escape", "description": "Closes the dialog" },
    { "key": "Tab", "description": "Moves focus to the next focusable element" }
  ]
}
```

## Complete example

A full spec exercising all fields:

```json
{
  "name": "Dialog",
  "description": "Modal dialog for focused interactions",
  "category": "feedback",
  "complexity": "complex",
  "props": [
    { "name": "open", "type": "boolean", "required": true },
    { "name": "onClose", "type": "() => void", "required": true },
    { "name": "title", "type": "string", "required": false },
    { "name": "size", "type": "string", "required": false, "default": "md" }
  ],
  "variants": [{ "name": "size", "values": ["sm", "md", "lg", "full"] }],
  "defaultVariants": {
    "size": "md"
  },
  "slots": [
    { "name": "header", "description": "Dialog header content" },
    { "name": "footer", "description": "Dialog footer with actions" }
  ],
  "anatomy": [
    { "name": "trigger", "description": "Element that opens the dialog", "required": true },
    { "name": "overlay", "description": "Background overlay", "required": true },
    { "name": "content", "description": "Dialog content area", "required": true },
    { "name": "header", "description": "Dialog header", "required": false },
    { "name": "footer", "description": "Dialog footer", "required": false },
    { "name": "close", "description": "Close button", "required": true }
  ],
  "tokenMapping": {
    "content.background": "{color.background}",
    "overlay.background": "{color.overlay}",
    "content.boxShadow": "{shadow.lg}",
    "content.borderRadius": "{borderRadius.lg}",
    "content.padding": "{spacing.lg}",
    "overlay.zIndex": "{zIndex.modal}"
  },
  "states": ["open", "closed"],
  "events": [{ "name": "onClose", "description": "Fired when the dialog is closed" }],
  "dependencies": ["Button"],
  "accessibility": {
    "role": "dialog",
    "ariaAttributes": ["aria-modal", "aria-labelledby", "aria-describedby"],
    "keyboardInteractions": [
      { "key": "Escape", "description": "Closes the dialog" },
      { "key": "Tab", "description": "Cycles focus within the dialog" }
    ]
  },
  "guidelines": [
    "Always trap focus within the dialog when open",
    "Return focus to the trigger element when closed",
    "Provide a visible close button in addition to Escape key"
  ]
}
```

## Validation behavior

Specs are validated using Zod's `safeParse`. The schema applies defaults for missing optional fields:

- `complexity` defaults to `"moderate"`
- `required` in props and slots defaults to `false`; `required` in anatomy parts defaults to `true`
- Array fields (`props`, `variants`, `slots`, `anatomy`, `states`, `events`, `dependencies`, `guidelines`) default to `[]`
- `defaultVariants` and `tokenMapping` default to `{}`

::: warning
When using `applyPreset()` programmatically, overrides use **shallow merge**, not deep merge. Passing `props: [...]` replaces all preset props, it does not append to them.
:::

## Related pages

- [Component Specs](/guide/component-specs) -- conceptual guide
- [Token Format](/reference/token-format) -- format for tokens referenced in `tokenMapping`
- [Validation](/guide/validation) -- how specs are validated against implementations
