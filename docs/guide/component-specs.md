---
title: Component Specs
---

# Component Specs

The component spec is grimorio's central concept. It is a JSON file that defines the contract for a component -- what props it accepts, which variants it supports, what design tokens it uses, and how it should behave for accessibility.

Both design and development validate against the spec. It is the source of truth.

## Spec structure

Here is a complete Button spec:

```json
{
  "name": "Button",
  "description": "Primary action button",
  "category": "actions",
  "complexity": "moderate",
  "props": [
    { "name": "variant", "type": "string", "required": false, "default": "primary" },
    { "name": "size", "type": "string", "required": false, "default": "md" },
    { "name": "disabled", "type": "boolean", "required": false }
  ],
  "variants": [
    { "name": "variant", "values": ["primary", "secondary", "ghost"] },
    { "name": "size", "values": ["sm", "md", "lg"] }
  ],
  "anatomy": [
    { "name": "root", "description": "Button wrapper", "required": true },
    { "name": "label", "description": "Text label", "required": true },
    { "name": "icon", "description": "Optional icon", "required": false }
  ],
  "tokenMapping": {
    "root.background": "{color.primary}",
    "root.background:hover": "{color.primary.hover}",
    "root.paddingInline[size=sm]": "{spacing.sm}",
    "root.paddingInline[size=md]": "{spacing.md}",
    "root.borderRadius": "{borderRadius.md}"
  },
  "states": ["hover", "focus", "active", "disabled"],
  "events": [{ "name": "onClick", "description": "Fired when button is clicked" }],
  "accessibility": {
    "role": "button",
    "ariaAttributes": ["aria-disabled", "aria-label"],
    "keyboardInteractions": [
      { "key": "Enter", "description": "Activates the button" },
      { "key": "Space", "description": "Activates the button" }
    ]
  },
  "guidelines": ["Always provide a visible label or aria-label"]
}
```

## Field reference

### name (required)

The component name. This is the only required field. Used to match the spec against component files during validation.

```json
{ "name": "Button" }
```

### description

A human-readable description of the component's purpose.

```json
{ "description": "Primary action button" }
```

### category

Classifies the component. Common categories: `actions`, `forms`, `feedback`, `navigation`, `data-display`, `layout`.

```json
{ "category": "actions" }
```

### complexity

Indicates how complex the component is. One of: `simple`, `moderate`, `complex`. Defaults to `moderate`.

```json
{ "complexity": "moderate" }
```

### props

An array of prop definitions. Each prop has:

| Field         | Type    | Required | Description                                             |
| ------------- | ------- | -------- | ------------------------------------------------------- |
| `name`        | string  | yes      | The prop name                                           |
| `type`        | string  | yes      | The prop type (e.g., `string`, `boolean`, `() => void`) |
| `required`    | boolean | no       | Whether the prop is required. Defaults to `false`       |
| `default`     | any     | no       | Default value                                           |
| `description` | string  | no       | Human-readable description                              |

```json
{
  "props": [
    { "name": "variant", "type": "string", "required": false, "default": "primary" },
    { "name": "onClick", "type": "() => void", "required": false, "description": "Click handler" }
  ]
}
```

### variants

Defines named variant axes with their allowed values.

| Field         | Type     | Required | Description                |
| ------------- | -------- | -------- | -------------------------- |
| `name`        | string   | yes      | Variant axis name          |
| `values`      | string[] | yes      | Allowed values             |
| `description` | string   | no       | Human-readable description |

```json
{
  "variants": [
    { "name": "variant", "values": ["primary", "secondary", "ghost"] },
    { "name": "size", "values": ["sm", "md", "lg"] }
  ]
}
```

### defaultVariants

A record mapping variant names to their default values.

```json
{
  "defaultVariants": {
    "variant": "primary",
    "size": "md"
  }
}
```

### slots

Named slots that the component accepts. Used for compound components and content injection.

| Field         | Type    | Required | Description                                       |
| ------------- | ------- | -------- | ------------------------------------------------- |
| `name`        | string  | yes      | Slot name                                         |
| `description` | string  | no       | Human-readable description                        |
| `required`    | boolean | no       | Whether the slot is required. Defaults to `false` |

```json
{
  "slots": [{ "name": "icon", "description": "Leading icon", "required": false }]
}
```

### tokenMapping

A record that maps component parts, properties, states, and variants to design token references using W3C DTCG reference syntax. Keys follow the pattern `part.property[:state][variant=value]`.

```json
{
  "tokenMapping": {
    "root.background": "{color.primary}",
    "root.background:hover": "{color.primary.hover}",
    "root.paddingInline[size=sm]": "{spacing.sm}",
    "root.paddingInline[size=md]": "{spacing.md}",
    "root.borderRadius": "{borderRadius.md}"
  }
}
```

During [validation](/guide/validation), token references are cross-referenced against your token files to ensure all referenced tokens exist.

### anatomy

An array of named sub-parts that make up the component. Each part has a name, an optional description, and a `required` flag (defaults to `true`).

```json
{
  "anatomy": [
    { "name": "root", "description": "Outer wrapper", "required": true },
    { "name": "label", "description": "Text content", "required": true },
    { "name": "icon", "description": "Optional icon slot", "required": false }
  ]
}
```

### states

An array of interactive states that the component supports.

```json
{
  "states": ["hover", "focus", "active", "disabled"]
}
```

### events

An array of event handlers that the component emits, separated from props. Each event has a name and an optional description.

```json
{
  "events": [
    { "name": "onClick", "description": "Fired when the button is clicked" },
    { "name": "onFocus", "description": "Fired when the button receives focus" }
  ]
}
```

### dependencies

Other components that this component depends on.

```json
{
  "dependencies": ["Icon", "Spinner"]
}
```

### accessibility

Accessibility requirements for the component.

| Field                  | Type     | Description                                                       |
| ---------------------- | -------- | ----------------------------------------------------------------- |
| `role`                 | string   | ARIA role (e.g., `button`, `dialog`, `tablist`)                   |
| `ariaAttributes`       | string[] | Required ARIA attributes                                          |
| `keyboardInteractions` | object[] | Expected keyboard interactions, each with `key` and `description` |

```json
{
  "accessibility": {
    "role": "button",
    "ariaAttributes": ["aria-disabled", "aria-label"],
    "keyboardInteractions": [
      { "key": "Enter", "description": "Activates the button" },
      { "key": "Space", "description": "Activates the button" }
    ]
  }
}
```

### guidelines

An array of free-text guidelines for implementers.

```json
{
  "guidelines": [
    "Always provide a visible label or aria-label",
    "Use the ghost variant for less prominent actions"
  ]
}
```

## Creating specs

There are several ways to create specs:

| Method                   | Command                              | AI?     |
| ------------------------ | ------------------------------------ | ------- |
| Infer from existing code | `grimorio spec:infer src/Button.tsx` | No      |
| Use a built-in preset    | `grimorio add Button`                | No      |
| Import from Figma        | `grimorio figma:import <url>`        | No      |
| Enrich via MCP prompt    | `enrich-spec` prompt                 | Via MCP |
| Write manually           | Create the JSON file directly        | No      |

## Presets

grimorio includes 10 built-in presets that generate complete specs: **button**, **input**, **select**, **checkbox**, **dialog**, **card**, **avatar**, **badge**, **tabs**, and **textarea**.

When you run `grimorio add Button`, the name is matched against preset IDs automatically. Each preset includes well-researched props, variants, accessibility rules, and guidelines.

::: tip
Use `grimorio add --list-presets` to see all available presets.
:::

## Related pages

- [Spec Schema Reference](/reference/spec-schema) -- full schema details with types
- [Validation](/guide/validation) -- how specs are validated against implementations
- [Design Tokens](/guide/design-tokens) -- the token format referenced by specs
