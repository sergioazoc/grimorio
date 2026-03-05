---
title: Importar desde Figma
---

# Importar desde Figma

grimorio puede importar specs de componentes desde Figma de forma determinística, sin usar AI. El comando `figma:import` lee las propiedades de un componente en Figma y las mapea a la estructura de un component spec.

## Requisitos previos

Necesitas un token de acceso a la API de Figma. Puedes obtenerlo en la [configuración de tu cuenta Figma](https://www.figma.com/developers/api#access-tokens).

Configura el token de una de estas formas (en orden de prioridad):

1. Flag `--token` en el comando
2. Campo `figma.token` en `grimorio.config.ts`
3. Variable de entorno `FIGMA_TOKEN`

```ts
// grimorio.config.ts
export default {
  figma: {
    token: "figd_...",
  },
};
```

O con variable de entorno:

```bash
export FIGMA_TOKEN="figd_..."
```

## Uso básico

### Listar componentes disponibles

Si no especificas `--component`, grimorio lista los componentes disponibles en el archivo:

```bash
grimorio figma:import "https://figma.com/design/ABC123/Mi-Design-System"
```

### Importar un componente

```bash
grimorio figma:import "https://figma.com/design/ABC123/Mi-Design-System" --component Button
```

### Importar un nodo específico

Si la URL incluye un `node-id`, se usa directamente:

```bash
grimorio figma:import "https://figma.com/design/ABC123/Mi-Design-System?node-id=1-234"
```

### Opciones

| Opción         | Descripción                                     |
| -------------- | ----------------------------------------------- |
| `--component`  | Nombre del componente a buscar en el archivo    |
| `--token`      | Token de la API de Figma (o usar `FIGMA_TOKEN`) |
| `--output, -o` | Ruta de salida para el spec                     |

## Reglas de mapeo

El mapeo de propiedades de Figma a campos del spec es determinista y sigue estas reglas:

### VARIANT -> variants + props

Las propiedades de tipo `VARIANT` en Figma se convierten en variantes y props del spec.

**Figma:**

```
Propiedad: Size (VARIANT)
Valores: Small, Medium, Large
```

**Spec resultante:**

```json
{
  "variants": [{ "name": "size", "values": ["small", "medium", "large"] }],
  "props": [{ "name": "size", "type": "string", "required": false }]
}
```

### BOOLEAN -> boolean props

Las propiedades `BOOLEAN` se convierten en props booleanas.

**Figma:**

```
Propiedad: Show Icon (BOOLEAN)
```

**Spec resultante:**

```json
{
  "props": [{ "name": "showIcon", "type": "boolean", "required": false }]
}
```

### TEXT -> string props

Las propiedades `TEXT` se convierten en props de tipo string.

**Figma:**

```
Propiedad: Label (TEXT)
```

**Spec resultante:**

```json
{
  "props": [{ "name": "label", "type": "string", "required": false }]
}
```

### INSTANCE_SWAP -> slots

Las propiedades `INSTANCE_SWAP` se convierten en slots.

**Figma:**

```
Propiedad: Left Icon (INSTANCE_SWAP)
```

**Spec resultante:**

```json
{
  "slots": [{ "name": "leftIcon" }]
}
```

### Variables de Figma -> tokenMapping

Las variables vinculadas (bound variables) en el nodo del componente se extraen y se convierten en mapeos estructurados `parte.propiedadCSS` a `{token.path}` (sintaxis de referencia W3C DTCG). La notación de Figma con `/` se convierte a `.`:

**Figma:**

```
Variable: color/primary (vinculada a fill en el nodo root)
```

**Spec resultante:**

```json
{
  "tokenMapping": {
    "root.background": "{color.primary}"
  },
  "anatomy": [],
  "states": [],
  "events": []
}
```

## Validar Figma contra un spec

Una vez que tienes un spec en tu repo, puedes validar que un componente de Figma coincide con él:

```bash
grimorio figma:validate "https://figma.com/design/ABC/..." --component Button
```

Compara el componente de Figma contra el spec existente y reporta diferencias:

- Props que existen en Figma pero no en el spec (y viceversa)
- Props con tipos diferentes o diferente valor de required
- Variantes con valores distintos
- Token mappings, anatomy, states y events faltantes o extra

Termina con código 1 si hay diferencias, lo que lo hace usable en CI.

Via MCP, un diseñador puede decirle a su AI: _"Valida mi Button de Figma contra el spec"_ y la AI llamará a `validate_figma` y reportará qué necesita cambiar.

## Detalles del procesamiento

### Limpieza de nombres

grimorio limpia los nombres de propiedades de Figma automáticamente:

- Elimina sufijos internos de Figma (como `#1234:5`)
- Convierte a camelCase (por ejemplo, `Show Icon` se convierte en `showIcon`)

### Detección de categoría

La categoría del componente se detecta automáticamente por el nombre:

| Patrón en el nombre  | Categoría      |
| -------------------- | -------------- |
| Button, Action       | `actions`      |
| Input, Select, Form  | `forms`        |
| Dialog, Alert, Toast | `feedback`     |
| Nav, Menu, Tab       | `navigation`   |
| Card, Table, List    | `data-display` |
| Layout, Grid, Stack  | `layout`       |

### Detección de complejidad

La complejidad se calcula según la cantidad de props y variantes:

| Props + Variantes | Complejidad |
| ----------------- | ----------- |
| 3 o menos         | `simple`    |
| 4 a 8             | `moderate`  |
| Más de 8          | `complex`   |

## Flujo de trabajo completo

Un flujo típico con Figma:

```bash
# 1. Ver qué componentes hay disponibles
grimorio figma:import "https://figma.com/design/ABC/..."

# 2. Importar el componente
grimorio figma:import "https://figma.com/design/ABC/..." --component Button -o specs/button.json

# 3. Iniciar el servidor MCP
grimorio mcp:serve

# 4. Decirle a tu AI: "Usa el prompt enrich-spec para Button"
#    (agrega accesibilidad, lineamientos, mapeo de tokens)

# 5. Decirle a tu AI: "Genera un componente React desde el spec de Button"
#    (usa el prompt generate-component)

# 6. Validar que el código cumple con el spec
grimorio validate
```

::: info Info
El comando `figma:import` valida el spec generado con `ComponentSpecSchema` antes de escribirlo. Si el mapeo produce un spec inválido, se reporta el error.
:::
