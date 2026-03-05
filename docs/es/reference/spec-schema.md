---
title: Schema del Component Spec
---

# Schema del Component Spec

Referencia completa del schema `ComponentSpec` de grimorio. Los specs se definen como archivos JSON y se validan contra este schema (implementado con Zod).

## ComponentSpec

| Campo             | Tipo                                  | Requerido | Default      | Descripción                         |
| ----------------- | ------------------------------------- | :-------: | ------------ | ----------------------------------- |
| `name`            | `string`                              |    Sí     | --           | Nombre del componente               |
| `description`     | `string`                              |    No     | --           | Descripción del componente          |
| `category`        | `string`                              |    No     | --           | Categoría del componente            |
| `complexity`      | `"simple" \| "moderate" \| "complex"` |    No     | `"moderate"` | Nivel de complejidad                |
| `props`           | `Prop[]`                              |    No     | `[]`         | Propiedades del componente          |
| `variants`        | `Variant[]`                           |    No     | `[]`         | Variantes del componente            |
| `defaultVariants` | `Record<string, string>`              |    No     | `{}`         | Valores por defecto de variantes    |
| `slots`           | `Slot[]`                              |    No     | `[]`         | Slots de composición                |
| `anatomy`         | `AnatomyPart[]`                       |    No     | `[]`         | Partes estructurales del componente |
| `tokenMapping`    | `Record<string, string>`              |    No     | `{}`         | Mapeo parte.propiedad → token       |
| `states`          | `string[]`                            |    No     | `[]`         | Estados interactivos del componente |
| `events`          | `Event[]`                             |    No     | `[]`         | Eventos que emite el componente     |
| `dependencies`    | `string[]`                            |    No     | `[]`         | Componentes de los que depende      |
| `accessibility`   | `Accessibility`                       |    No     | --           | Requisitos de accesibilidad         |
| `guidelines`      | `string[]`                            |    No     | `[]`         | Lineamientos de uso                 |

El único campo obligatorio es `name`. Todos los demás tienen defaults razonables.

## Prop

Cada prop describe una propiedad del componente.

| Campo         | Tipo      | Requerido | Default | Descripción               |
| ------------- | --------- | :-------: | ------- | ------------------------- |
| `name`        | `string`  |    Sí     | --      | Nombre de la prop         |
| `type`        | `string`  |    Sí     | --      | Tipo de dato              |
| `required`    | `boolean` |    No     | `false` | Si la prop es obligatoria |
| `default`     | `any`     |    No     | --      | Valor por defecto         |
| `description` | `string`  |    No     | --      | Descripción de la prop    |

### Tipos comunes

El campo `type` es un string libre. Los valores más comunes son:

- `"string"` -- cadena de texto
- `"boolean"` -- verdadero/falso
- `"number"` -- numérico
- `"ReactNode"` -- contenido React (children, slots)
- `"function"` -- callback
- `"string | string[]"` -- unión de tipos

### Ejemplo

```json
{
  "props": [
    {
      "name": "variant",
      "type": "string",
      "required": false,
      "default": "primary",
      "description": "Estilo visual del componente"
    },
    {
      "name": "disabled",
      "type": "boolean",
      "required": false
    },
    {
      "name": "children",
      "type": "ReactNode",
      "required": true,
      "description": "Contenido del componente"
    }
  ]
}
```

## Variant

Cada variante define un eje de variación del componente.

| Campo         | Tipo       | Requerido | Descripción                |
| ------------- | ---------- | :-------: | -------------------------- |
| `name`        | `string`   |    Sí     | Nombre de la variante      |
| `values`      | `string[]` |    Sí     | Valores posibles           |
| `description` | `string`   |    No     | Descripción de la variante |

### Ejemplo

```json
{
  "variants": [
    {
      "name": "variant",
      "values": ["primary", "secondary", "ghost", "destructive"],
      "description": "Estilo visual del botón"
    },
    {
      "name": "size",
      "values": ["sm", "md", "lg"]
    }
  ]
}
```

## Slot

Cada slot define un punto de composición del componente.

| Campo         | Tipo      | Requerido | Default | Descripción               |
| ------------- | --------- | :-------: | ------- | ------------------------- |
| `name`        | `string`  |    Sí     | --      | Nombre del slot           |
| `description` | `string`  |    No     | --      | Descripción del slot      |
| `required`    | `boolean` |    No     | `false` | Si el slot es obligatorio |

### Ejemplo

```json
{
  "slots": [
    {
      "name": "icon",
      "description": "Icono a mostrar junto al texto",
      "required": false
    },
    {
      "name": "badge",
      "description": "Badge superpuesto"
    }
  ]
}
```

## Accessibility

Define los requisitos de accesibilidad del componente.

| Campo                  | Tipo                                     | Requerido | Default | Descripción               |
| ---------------------- | ---------------------------------------- | :-------: | ------- | ------------------------- |
| `role`                 | `string`                                 |    No     | --      | Rol ARIA del componente   |
| `ariaAttributes`       | `string[]`                               |    No     | `[]`    | Atributos ARIA requeridos |
| `keyboardInteractions` | `{ key: string, description: string }[]` |    No     | `[]`    | Interacciones de teclado  |

### Ejemplo

```json
{
  "accessibility": {
    "role": "button",
    "ariaAttributes": ["aria-disabled", "aria-label", "aria-pressed"],
    "keyboardInteractions": [
      { "key": "Enter", "description": "Activa el botón" },
      { "key": "Space", "description": "Activa el botón" },
      { "key": "Escape", "description": "Cancela la acción en curso" }
    ]
  }
}
```

## AnatomyPart

Cada parte de la anatomía describe un sub-elemento estructural del componente.

| Campo         | Tipo      | Requerido | Default | Descripción                |
| ------------- | --------- | :-------: | ------- | -------------------------- |
| `name`        | `string`  |    Sí     | --      | Nombre de la parte         |
| `description` | `string`  |    No     | --      | Descripción de la parte    |
| `required`    | `boolean` |    No     | `true`  | Si la parte es obligatoria |

### Ejemplo

```json
{
  "anatomy": [
    { "name": "root", "description": "Contenedor principal", "required": true },
    { "name": "label", "description": "Etiqueta de texto", "required": true },
    { "name": "icon", "description": "Icono opcional", "required": false }
  ]
}
```

## Event

Cada evento describe un handler que el componente expone.

| Campo         | Tipo     | Requerido | Descripción            |
| ------------- | -------- | :-------: | ---------------------- |
| `name`        | `string` |    Sí     | Nombre del evento      |
| `description` | `string` |    No     | Descripción del evento |

### Ejemplo

```json
{
  "events": [
    { "name": "onClick", "description": "Se dispara al hacer clic" },
    { "name": "onClose", "description": "Se dispara al cerrar" }
  ]
}
```

## Valores de complexity

| Valor      | Descripción                                         |
| ---------- | --------------------------------------------------- |
| `simple`   | Componente básico, pocas props, sin estado complejo |
| `moderate` | Componente con variantes, estado moderado           |
| `complex`  | Componente compuesto, múltiples partes, estado rico |

## Valores comunes de category

La categoría es un string libre, pero estos son los valores comunes usados por los presets y la detección automática:

| Categoría      | Componentes típicos                |
| -------------- | ---------------------------------- |
| `actions`      | Button, IconButton, FloatingAction |
| `forms`        | Input, Select, Checkbox, Textarea  |
| `feedback`     | Dialog, Alert, Toast, Notification |
| `navigation`   | Nav, Menu, Tabs, Breadcrumb        |
| `data-display` | Card, Table, List, Badge, Avatar   |
| `layout`       | Grid, Stack, Container, Divider    |

## Schema Zod

Para referencia, este es el schema Zod que define la estructura:

```ts
const PropSchema = z.object({
  name: z.string(),
  type: z.string(),
  required: z.boolean().default(false),
  default: z.unknown().optional(),
  description: z.string().optional(),
});

const VariantSchema = z.object({
  name: z.string(),
  values: z.array(z.string()),
  description: z.string().optional(),
});

const SlotSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  required: z.boolean().default(false),
});

const AnatomyPartSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  required: z.boolean().default(true),
});

const EventSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

const AccessibilitySchema = z.object({
  role: z.string().optional(),
  ariaAttributes: z.array(z.string()).default([]),
  keyboardInteractions: z
    .array(
      z.object({
        key: z.string(),
        description: z.string(),
      }),
    )
    .default([]),
});

const ComponentSpecSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  complexity: z.enum(["simple", "moderate", "complex"]).default("moderate"),
  props: z.array(PropSchema).default([]),
  variants: z.array(VariantSchema).default([]),
  defaultVariants: z.record(z.string(), z.string()).default({}),
  slots: z.array(SlotSchema).default([]),
  anatomy: z.array(AnatomyPartSchema).default([]),
  tokenMapping: z.record(z.string(), z.string()).default({}),
  states: z.array(z.string()).default([]),
  events: z.array(EventSchema).default([]),
  dependencies: z.array(z.string()).default([]),
  accessibility: AccessibilitySchema.optional(),
  guidelines: z.array(z.string()).default([]),
});
```

## Spec completo de ejemplo

```json
{
  "name": "Dialog",
  "description": "Ventana de diálogo modal",
  "category": "feedback",
  "complexity": "complex",
  "props": [
    {
      "name": "open",
      "type": "boolean",
      "required": true,
      "description": "Si el diálogo está abierto"
    },
    {
      "name": "onClose",
      "type": "function",
      "required": true,
      "description": "Callback al cerrar"
    },
    { "name": "title", "type": "string", "required": false, "description": "Título del diálogo" },
    { "name": "size", "type": "string", "required": false, "default": "md" }
  ],
  "variants": [{ "name": "size", "values": ["sm", "md", "lg", "fullscreen"] }],
  "defaultVariants": {
    "size": "md"
  },
  "slots": [
    { "name": "header", "description": "Contenido del encabezado" },
    { "name": "footer", "description": "Contenido del pie", "required": false }
  ],
  "anatomy": [
    { "name": "trigger", "description": "Elemento que abre el diálogo", "required": false },
    { "name": "overlay", "description": "Fondo oscuro", "required": true },
    { "name": "content", "description": "Contenedor del contenido", "required": true },
    { "name": "header", "description": "Encabezado del diálogo", "required": false },
    { "name": "body", "description": "Cuerpo del diálogo", "required": true },
    { "name": "footer", "description": "Pie del diálogo", "required": false },
    { "name": "close-button", "description": "Botón de cerrar", "required": true }
  ],
  "tokenMapping": {
    "overlay.background": "{color.overlay}",
    "content.background": "{color.background}",
    "content.shadow": "{shadow.lg}",
    "content.borderRadius": "{borderRadius.lg}",
    "content.padding": "{spacing.lg}",
    "content.zIndex": "{zIndex.modal}"
  },
  "states": ["open", "closing"],
  "events": [
    { "name": "onClose", "description": "Se dispara al cerrar el diálogo" },
    { "name": "onOpenChange", "description": "Se dispara al cambiar el estado abierto/cerrado" }
  ],
  "dependencies": ["Button", "Icon"],
  "accessibility": {
    "role": "dialog",
    "ariaAttributes": ["aria-modal", "aria-labelledby", "aria-describedby"],
    "keyboardInteractions": [
      { "key": "Escape", "description": "Cierra el diálogo" },
      {
        "key": "Tab",
        "description": "Mueve el foco al siguiente elemento focusable dentro del diálogo"
      },
      {
        "key": "Shift+Tab",
        "description": "Mueve el foco al elemento focusable anterior dentro del diálogo"
      }
    ]
  },
  "guidelines": [
    "Atrapar el foco dentro del diálogo mientras está abierto",
    "Devolver el foco al elemento que abrió el diálogo al cerrarlo",
    "Siempre incluir un título visible o aria-labelledby",
    "Proporcionar una forma clara de cerrar el diálogo"
  ]
}
```
