---
title: Component Specs
---

# Component Specs

El component spec es el contrato central de grimorio. Es un archivo JSON que describe completamente lo que un componente es: sus props, variantes, tokens de diseño, requisitos de accesibilidad y lineamientos de uso.

Tanto el código como el diseño validan contra el spec. Esto garantiza que ambos lados estén alineados.

## Estructura de un spec

Un spec tiene la siguiente forma:

```json
{
  "name": "Button",
  "description": "Botón de acción principal",
  "category": "actions",
  "complexity": "moderate",
  "props": [...],
  "variants": [...],
  "defaultVariants": {},
  "slots": [...],
  "anatomy": [...],
  "tokenMapping": {...},
  "states": [...],
  "events": [...],
  "dependencies": [...],
  "accessibility": {...},
  "guidelines": [...]
}
```

## Campos del spec

### `name` (requerido)

El nombre del componente. Es el único campo obligatorio.

```json
{ "name": "Button" }
```

### `description`

Descripción breve del componente.

```json
{ "description": "Botón de acción principal con variantes de estilo y tamaño" }
```

### `category`

Categoría del componente. Valores comunes: `"actions"`, `"forms"`, `"feedback"`, `"navigation"`, `"data-display"`, `"layout"`.

```json
{ "category": "actions" }
```

### `complexity`

Nivel de complejidad del componente. Valores posibles: `"simple"`, `"moderate"`, `"complex"`. Valor por defecto: `"moderate"`.

```json
{ "complexity": "moderate" }
```

### `props`

Array de propiedades del componente. Cada prop tiene:

| Campo         | Tipo      | Requerido | Descripción                              |
| ------------- | --------- | --------- | ---------------------------------------- |
| `name`        | `string`  | Sí        | Nombre de la prop                        |
| `type`        | `string`  | Sí        | Tipo de dato (`string`, `boolean`, etc.) |
| `required`    | `boolean` | No        | Si es obligatoria (default: `false`)     |
| `default`     | `any`     | No        | Valor por defecto                        |
| `description` | `string`  | No        | Descripción de la prop                   |

```json
{
  "props": [
    { "name": "variant", "type": "string", "required": false, "default": "primary" },
    { "name": "size", "type": "string", "required": false, "default": "md" },
    { "name": "disabled", "type": "boolean", "required": false },
    {
      "name": "children",
      "type": "ReactNode",
      "required": true,
      "description": "Contenido del botón"
    }
  ]
}
```

### `variants`

Array de variantes del componente. Cada variante tiene:

| Campo         | Tipo       | Requerido | Descripción                |
| ------------- | ---------- | --------- | -------------------------- |
| `name`        | `string`   | Sí        | Nombre de la variante      |
| `values`      | `string[]` | Sí        | Valores posibles           |
| `description` | `string`   | No        | Descripción de la variante |

```json
{
  "variants": [
    { "name": "variant", "values": ["primary", "secondary", "ghost"] },
    { "name": "size", "values": ["sm", "md", "lg"] }
  ]
}
```

### `defaultVariants`

Valores por defecto para cada variante. Mapa de nombre de variante a su valor por defecto.

```json
{
  "defaultVariants": {
    "variant": "primary",
    "size": "md"
  }
}
```

### `slots`

Array de slots del componente (puntos de composición). Cada slot tiene:

| Campo         | Tipo      | Requerido | Descripción                          |
| ------------- | --------- | --------- | ------------------------------------ |
| `name`        | `string`  | Sí        | Nombre del slot                      |
| `description` | `string`  | No        | Descripción del slot                 |
| `required`    | `boolean` | No        | Si es obligatorio (default: `false`) |

```json
{
  "slots": [
    { "name": "icon", "description": "Icono a la izquierda del texto" },
    { "name": "badge", "description": "Badge superpuesto", "required": false }
  ]
}
```

### `anatomy`

Array de partes estructurales del componente. Cada parte tiene:

| Campo         | Tipo      | Requerido | Descripción                         |
| ------------- | --------- | --------- | ----------------------------------- |
| `name`        | `string`  | Sí        | Nombre de la parte                  |
| `description` | `string`  | No        | Descripción de la parte             |
| `required`    | `boolean` | No        | Si es obligatoria (default: `true`) |

```json
{
  "anatomy": [
    { "name": "root", "description": "Contenedor principal", "required": true },
    { "name": "label", "description": "Etiqueta de texto", "required": true },
    { "name": "icon", "description": "Icono opcional", "required": false }
  ]
}
```

### `tokenMapping`

Mapa de `part.property[:state][variant=value]` a una referencia de token W3C DTCG (`{token.path}`). Asocia cada propiedad visual de una parte del componente con el token de diseño correspondiente.

Formato de la clave: `parte.propiedad[:estado][variante=valor]`

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

### `states`

Array de estados interactivos del componente (hover, focus, active, disabled, etc.).

```json
{
  "states": ["hover", "focus", "active", "disabled"]
}
```

### `events`

Array de eventos que emite el componente. Cada evento tiene:

| Campo         | Tipo     | Requerido | Descripción            |
| ------------- | -------- | --------- | ---------------------- |
| `name`        | `string` | Sí        | Nombre del evento      |
| `description` | `string` | No        | Descripción del evento |

```json
{
  "events": [
    { "name": "onClick", "description": "Se dispara al hacer clic" },
    { "name": "onFocus", "description": "Se dispara al recibir foco" }
  ]
}
```

### `dependencies`

Array de otros componentes de los que depende.

```json
{
  "dependencies": ["Icon", "Spinner"]
}
```

### `accessibility`

Objeto con los requisitos de accesibilidad del componente.

| Campo                  | Tipo       | Descripción                                  |
| ---------------------- | ---------- | -------------------------------------------- |
| `role`                 | `string`   | Rol ARIA del componente                      |
| `ariaAttributes`       | `string[]` | Atributos ARIA requeridos                    |
| `keyboardInteractions` | `array`    | Interacciones de teclado (key + description) |

```json
{
  "accessibility": {
    "role": "button",
    "ariaAttributes": ["aria-disabled", "aria-label"],
    "keyboardInteractions": [
      { "key": "Enter", "description": "Activa el botón" },
      { "key": "Space", "description": "Activa el botón" }
    ]
  }
}
```

### `guidelines`

Array de lineamientos de uso del componente.

```json
{
  "guidelines": [
    "Siempre proporcionar una etiqueta visible o aria-label",
    "Usar la variante 'primary' para la acción principal de la página",
    "No usar más de un botón primario por sección"
  ]
}
```

## Ejemplo completo: Button

```json
{
  "name": "Button",
  "description": "Botón de acción principal",
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
  "defaultVariants": {
    "variant": "primary",
    "size": "md"
  },
  "slots": [],
  "anatomy": [
    { "name": "root", "description": "Contenedor del botón", "required": true },
    { "name": "label", "description": "Etiqueta de texto", "required": true },
    { "name": "icon", "description": "Icono opcional", "required": false }
  ],
  "tokenMapping": {
    "root.background": "{color.primary}",
    "root.background:hover": "{color.primary.hover}",
    "root.paddingInline[size=sm]": "{spacing.sm}",
    "root.paddingInline[size=md]": "{spacing.md}",
    "root.borderRadius": "{borderRadius.md}"
  },
  "states": ["hover", "focus", "active", "disabled"],
  "events": [{ "name": "onClick", "description": "Se dispara al hacer clic en el botón" }],
  "dependencies": [],
  "accessibility": {
    "role": "button",
    "ariaAttributes": ["aria-disabled", "aria-label"],
    "keyboardInteractions": [
      { "key": "Enter", "description": "Activa el botón" },
      { "key": "Space", "description": "Activa el botón" }
    ]
  },
  "guidelines": ["Siempre proporcionar una etiqueta visible o aria-label"]
}
```

## Crear specs

Hay varias formas de crear un spec:

| Método     | Comando                          | AI?     | Descripción                |
| ---------- | -------------------------------- | ------- | -------------------------- |
| Preset     | `grimorio add Button`            | No      | Usa un preset integrado    |
| Inferir    | `grimorio spec:infer Button.tsx` | No      | Analiza código existente   |
| Figma      | `grimorio figma:import <url>`    | No      | Importa desde Figma        |
| Enriquecer | Prompt `enrich-spec` via MCP     | Via MCP | Agrega a11y y lineamientos |
| Manual     | Crear el JSON directamente       | No      | Control total              |

::: tip Consejo
El camino más rápido para empezar es `grimorio add <nombre>`. Si el nombre coincide con un preset (button, input, select, checkbox, dialog, card, avatar, badge, tabs, textarea), genera un spec completo automáticamente.
:::

## Validar specs

Una vez que tienes specs y componentes, valida que estén alineados:

```bash
grimorio validate
grimorio validate --level strict
grimorio validate --watch
```

Consulta la [guía de validación](/es/guide/validation) para más detalles sobre los niveles de validación.

## Referencia completa

Para la referencia completa del schema con todos los tipos, consulta [Spec Schema](/es/reference/spec-schema).
