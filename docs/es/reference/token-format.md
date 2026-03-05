---
title: Formato de tokens
---

# Formato de tokens

Referencia completa del formato de tokens de diseño de grimorio, basado en la especificación [W3C Design Tokens Community Group (DTCG)](https://design-tokens.github.io/community-group/format/).

## Estructura de un token

Cada token es un objeto con un `$value` obligatorio y propiedades opcionales:

```json
{
  "$value": "#3b82f6",
  "$type": "color",
  "$description": "Color de marca principal",
  "$deprecated": false,
  "$extensions": {}
}
```

| Propiedad      | Tipo                                             | Requerido | Descripción                                  |
| -------------- | ------------------------------------------------ | :-------: | -------------------------------------------- |
| `$value`       | `string \| number \| boolean \| array \| object` |    Sí     | Valor del token                              |
| `$type`        | `string`                                         |    No     | Tipo del token (se hereda del grupo padre)   |
| `$description` | `string`                                         |    No     | Descripción del token                        |
| `$deprecated`  | `boolean \| string`                              |    No     | Si está deprecado (o mensaje de deprecación) |
| `$extensions`  | `Record<string, unknown>`                        |    No     | Extensiones personalizadas                   |

## Grupos de tokens

Los tokens se organizan en grupos anidados. Un grupo puede definir `$type` y `$description`, que se propagan a todos los tokens hijos:

```json
{
  "color": {
    "$type": "color",
    "$description": "Colores del sistema",
    "primary": { "$value": "#3b82f6" },
    "secondary": { "$value": "#6b7280" },
    "error": {
      "$description": "Colores de error",
      "default": { "$value": "#ef4444" },
      "light": { "$value": "#fca5a5" }
    }
  }
}
```

En este ejemplo, `color.primary`, `color.secondary`, `color.error.default` y `color.error.light` todos heredan `$type: "color"` del grupo padre.

## Valores de $type soportados

### Tipos simples

| `$type`      | Formato de `$value`     | Ejemplo                          |
| ------------ | ----------------------- | -------------------------------- |
| `color`      | string (hex, rgb, etc.) | `"#3b82f6"`, `"rgb(59,130,246)"` |
| `dimension`  | string con unidad       | `"1rem"`, `"16px"`, `"0.5em"`    |
| `fontFamily` | string                  | `"Inter, sans-serif"`            |
| `fontWeight` | number o string         | `400`, `700`, `"bold"`           |
| `duration`   | string con unidad       | `"150ms"`, `"0.3s"`              |
| `number`     | number                  | `1.5`, `0`, `50`                 |

### Tipos compuestos

#### shadow

```json
{
  "$type": "shadow",
  "$value": {
    "offsetX": "0px",
    "offsetY": "4px",
    "blur": "6px",
    "spread": "-1px",
    "color": "rgba(0, 0, 0, 0.1)"
  }
}
```

**Salida CSS:** `0px 4px 6px -1px rgba(0, 0, 0, 0.1)`

| Campo     | Tipo     | Descripción               |
| --------- | -------- | ------------------------- |
| `offsetX` | `string` | Desplazamiento horizontal |
| `offsetY` | `string` | Desplazamiento vertical   |
| `blur`    | `string` | Radio de blur             |
| `spread`  | `string` | Radio de spread           |
| `color`   | `string` | Color de la sombra        |

#### border

```json
{
  "$type": "border",
  "$value": {
    "width": "1px",
    "style": "solid",
    "color": "#e5e7eb"
  }
}
```

**Salida CSS:** `1px solid #e5e7eb`

| Campo   | Tipo     | Descripción                  |
| ------- | -------- | ---------------------------- |
| `width` | `string` | Ancho del borde              |
| `style` | `string` | Estilo (solid, dashed, etc.) |
| `color` | `string` | Color del borde              |

#### transition

```json
{
  "$type": "transition",
  "$value": {
    "property": "opacity",
    "duration": "200ms",
    "timingFunction": "ease-in-out",
    "delay": "0ms"
  }
}
```

**Salida CSS:** `opacity 200ms ease-in-out 0ms`

| Campo            | Tipo     | Descripción               |
| ---------------- | -------- | ------------------------- |
| `property`       | `string` | Propiedad CSS a animar    |
| `duration`       | `string` | Duración de la transición |
| `timingFunction` | `string` | Función de timing         |
| `delay`          | `string` | Retraso antes de iniciar  |

#### gradient

```json
{
  "$type": "gradient",
  "$value": {
    "type": "linear",
    "stops": [
      { "color": "#000000", "position": "0%" },
      { "color": "#ffffff", "position": "100%" }
    ]
  }
}
```

**Salida CSS:** `linear-gradient(#000000 0%, #ffffff 100%)`

| Campo   | Tipo     | Descripción                         |
| ------- | -------- | ----------------------------------- |
| `type`  | `string` | Tipo de gradiente (linear, radial)  |
| `stops` | `array`  | Array de paradas (color + position) |

#### cubicBezier

```json
{
  "$type": "cubicBezier",
  "$value": [0.4, 0, 0.2, 1]
}
```

**Salida CSS:** `cubic-bezier(0.4, 0, 0.2, 1)`

El valor es un array de 4 números que definen los puntos de control de la curva Bézier.

#### strokeStyle

```json
{
  "$type": "strokeStyle",
  "$value": {
    "dashArray": ["2px", "4px"]
  }
}
```

**Salida CSS:** `2px 4px` (como valor de `stroke-dasharray`)

#### typography (informativo)

Los tokens de tipo typography se serializan como JSON ya que no tienen un equivalente directo a una sola propiedad CSS.

## Referencias entre tokens

Los tokens pueden referenciar otros tokens usando la sintaxis de llaves:

```json
{
  "color": {
    "$type": "color",
    "base": { "$value": "#3b82f6" },
    "primary": { "$value": "{color.base}" },
    "action": { "$value": "{color.primary}" }
  }
}
```

### Reglas de las referencias

- La ruta usa notación de punto: `{grupo.subgrupo.token}`
- Las llaves son opcionales al resolver via API: tanto `"color.primary"` como `"{color.primary}"` funcionan
- Las referencias se resuelven durante la exportación
- Las referencias encadenadas se resuelven recursivamente (`action` -> `primary` -> `base`)
- Las referencias circulares se detectan y se manejan de forma segura (no causan bucle infinito)
- La resolución se puede desactivar con `resolveReferences: false` en las opciones de `flattenWithTypes()`

## Tokens deprecados

Marca tokens como deprecados con `$deprecated`:

```json
{
  "color": {
    "old-brand": {
      "$value": "#3b82f6",
      "$deprecated": true
    },
    "legacy-accent": {
      "$value": "#8b5cf6",
      "$deprecated": "Migrar a color.accent. Se eliminará en v2."
    }
  }
}
```

Cuando `$deprecated` es un string, se usa como mensaje de deprecación. El comando `tokens:validate` reporta advertencias cuando un spec referencia tokens deprecados.

## Formatos de exportación

### CSS

```bash
grimorio tokens:export css
```

Genera custom properties en `:root`:

```css
/* Color de marca principal */
:root {
  --color-primary: #3b82f6;
  --color-secondary: #6b7280;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --shadow-md: 0px 4px 6px -1px rgba(0, 0, 0, 0.1);
  --easing-ease: cubic-bezier(0.4, 0, 0.2, 1);
}
```

Con `--prefix ds`:

```css
:root {
  --ds-color-primary: #3b82f6;
}
```

### CSS multi-tema

Cuando la configuración tiene múltiples temas y no se especifica `--theme`:

```css
:root {
  --color-primary: #3b82f6;
  --color-background: #ffffff;
}
[data-theme="dark"] {
  --color-primary: #1e40af;
  --color-background: #0f172a;
}
```

### SCSS

```bash
grimorio tokens:export scss
```

Genera variables SCSS:

```scss
// Color de marca principal
$color-primary: #3b82f6;
$color-secondary: #6b7280;
$spacing-sm: 0.5rem;
$spacing-md: 1rem;
```

### JS

```bash
grimorio tokens:export js
```

Genera un módulo ES:

```js
/** Color de marca principal */
export const colorPrimary = "#3b82f6";
export const colorSecondary = "#6b7280";
export const spacingSm = "0.5rem";
export const spacingMd = "1rem";
```

### Tailwind

```bash
grimorio tokens:export tailwind
```

Genera configuración para `theme.extend` de Tailwind:

```js
export default {
  colors: {
    primary: "#3b82f6",
    secondary: "#6b7280",
  },
  spacing: {
    sm: "0.5rem",
    md: "1rem",
  },
};
```

## Opciones de exportación

| Opción              | Formatos  | Descripción                          |
| ------------------- | --------- | ------------------------------------ |
| `--prefix`          | CSS, SCSS | Prefijo para nombres de variables    |
| `--no-descriptions` | Todos     | Omitir comentarios de descripción    |
| `--output, -o`      | Todos     | Escribir a archivo (default: stdout) |
| `--theme`           | Todos     | Exportar un tema específico          |

## Schema del archivo de tokens

El schema Zod que valida los archivos de tokens:

```ts
const DesignTokenSchema = z.object({
  $value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.unknown()),
    z.record(z.string(), z.unknown()),
  ]),
  $type: z.string().optional(),
  $description: z.string().optional(),
  $extensions: z.record(z.string(), z.unknown()).optional(),
  $deprecated: z.union([z.boolean(), z.string()]).optional(),
});

const TokenGroupSchema: z.ZodType<TokenGroup> = z.lazy(() =>
  z.record(
    z.string(),
    z.union([DesignTokenSchema, TokenGroupSchema, z.string(), z.record(z.string(), z.unknown())]),
  ),
);

const TokenFileSchema = z.object({}).catchall(z.union([DesignTokenSchema, TokenGroupSchema]));
```

::: info Info
`loadTokens()` en core **no** valida contra `TokenFileSchema` al cargar. Solo parsea el JSON. La validación explícita se hace con `tokens:validate`. Esto es intencional para permitir flexibilidad al cargar archivos de tokens parciales o en progreso.
:::
