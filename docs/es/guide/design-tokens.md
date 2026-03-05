---
title: Design Tokens
---

# Design Tokens

grimorio usa el formato [W3C Design Tokens Community Group (DTCG)](https://design-tokens.github.io/community-group/format/) para los tokens de diseño. Los tokens son valores de diseño atómicos (colores, espaciados, tipografía, etc.) que se comparten entre diseño y código.

## Estructura básica

Un archivo de tokens es un JSON con grupos anidados. Cada token tiene un `$value` y opcionalmente `$type`, `$description` y `$deprecated`:

```json
{
  "color": {
    "$type": "color",
    "primary": {
      "$value": "#3b82f6",
      "$description": "Color de marca principal"
    },
    "secondary": {
      "$value": "#6b7280"
    }
  },
  "spacing": {
    "$type": "dimension",
    "sm": { "$value": "0.5rem" },
    "md": { "$value": "1rem" },
    "lg": { "$value": "1.5rem" }
  }
}
```

El `$type` definido en un grupo se propaga a todos los tokens hijos. En el ejemplo anterior, `color.primary` y `color.secondary` heredan `$type: "color"`.

## Tokens por defecto

Al ejecutar `grimorio init`, se genera un archivo `tokens.json` con un set completo de tokens que cubre 13 categorías W3C DTCG:

| Categoría     | `$type`       | Ejemplo de valores     |
| ------------- | ------------- | ---------------------- |
| color         | `color`       | `#3b82f6`, `#ef4444`   |
| spacing       | `dimension`   | `0.5rem`, `1rem`       |
| fontSize      | `dimension`   | `0.875rem`, `1.125rem` |
| fontFamily    | `fontFamily`  | `"Inter, sans-serif"`  |
| fontWeight    | `fontWeight`  | `400`, `700`           |
| lineHeight    | `number`      | `1.5`, `1.75`          |
| letterSpacing | `dimension`   | `-0.025em`, `0.05em`   |
| borderRadius  | `dimension`   | `0.25rem`, `0.5rem`    |
| shadow        | `shadow`      | Objeto compuesto       |
| opacity       | `number`      | `0`, `0.5`, `1`        |
| zIndex        | `number`      | `10`, `50`, `999`      |
| duration      | `duration`    | `150ms`, `300ms`       |
| easing        | `cubicBezier` | `[0.4, 0, 0.2, 1]`     |

Los valores siguen las convenciones de Tailwind CSS.

## Referencias entre tokens

Los tokens pueden referenciar otros tokens usando la sintaxis `{ruta.al.token}`:

```json
{
  "color": {
    "$type": "color",
    "base": { "$value": "#3b82f6" },
    "primary": { "$value": "{color.base}" }
  }
}
```

Las referencias se resuelven automáticamente durante la exportación. Las referencias encadenadas (un token que referencia otro que a su vez referencia otro) y las referencias circulares se manejan de forma segura.

## Tipos compuestos

Además de valores simples (strings, números), grimorio soporta tipos compuestos:

### shadow

```json
{
  "shadow": {
    "$type": "shadow",
    "md": {
      "$value": {
        "offsetX": "0px",
        "offsetY": "4px",
        "blur": "6px",
        "spread": "-1px",
        "color": "rgba(0, 0, 0, 0.1)"
      }
    }
  }
}
```

Se serializa a CSS como: `0px 4px 6px -1px rgba(0, 0, 0, 0.1)`

### border

```json
{
  "border": {
    "$type": "border",
    "default": {
      "$value": {
        "width": "1px",
        "style": "solid",
        "color": "#000000"
      }
    }
  }
}
```

Se serializa a CSS como: `1px solid #000000`

### transition

```json
{
  "transition": {
    "$type": "transition",
    "fade": {
      "$value": {
        "property": "opacity",
        "duration": "200ms",
        "timingFunction": "ease-in-out",
        "delay": "0ms"
      }
    }
  }
}
```

Se serializa a CSS como: `opacity 200ms ease-in-out 0ms`

### gradient

```json
{
  "gradient": {
    "$type": "gradient",
    "primary": {
      "$value": {
        "type": "linear",
        "stops": [
          { "color": "#000000", "position": "0%" },
          { "color": "#ffffff", "position": "100%" }
        ]
      }
    }
  }
}
```

Se serializa a CSS como: `linear-gradient(#000000 0%, #ffffff 100%)`

### cubicBezier

```json
{
  "easing": {
    "$type": "cubicBezier",
    "ease": {
      "$value": [0.4, 0, 0.2, 1]
    }
  }
}
```

Se serializa a CSS como: `cubic-bezier(0.4, 0, 0.2, 1)`

## Tokens deprecados

Puedes marcar tokens como deprecados con `$deprecated`:

```json
{
  "color": {
    "old-primary": {
      "$value": "#3b82f6",
      "$deprecated": true
    },
    "legacy-brand": {
      "$value": "#1e40af",
      "$deprecated": "Usar color.primary en su lugar"
    }
  }
}
```

El comando `tokens:validate` reporta advertencias cuando un spec referencia tokens deprecados.

## Configuración multi-tema

grimorio soporta múltiples archivos de tokens para diferentes temas. Configura los temas en `grimorio.config.ts`:

```ts
export default {
  tokens: {
    default: "./tokens.json",
    dark: "./tokens-dark.json",
  },
};
```

### Exportación multi-tema

Al exportar a CSS sin especificar tema, se genera un archivo con todos los temas combinados:

```css
:root {
  --color-primary: #3b82f6;
}
[data-theme="dark"] {
  --color-primary: #1e40af;
}
```

Para otros formatos (SCSS, JS, Tailwind), usa `--theme` para exportar un tema específico:

```bash
grimorio tokens:export scss --theme dark
```

### Validación multi-tema

El comando `tokens:validate` valida todos los temas automáticamente. El comando `tokens:list` muestra el tema `default` por defecto; usa `--theme` para inspeccionar otro.

## Formatos de exportación

grimorio puede exportar tokens a cuatro formatos:

```bash
grimorio tokens:export css                    # CSS custom properties
grimorio tokens:export scss --prefix ds       # Variables SCSS con prefijo
grimorio tokens:export js                     # Módulo ES con exports
grimorio tokens:export tailwind -o tokens.js  # Config de Tailwind
```

| Formato    | Salida                            | Ejemplo                              |
| ---------- | --------------------------------- | ------------------------------------ |
| `css`      | Custom properties en `:root {}`   | `--color-primary: #3b82f6;`          |
| `scss`     | Variables SCSS                    | `$color-primary: #3b82f6;`           |
| `js`       | Exports de módulo ES              | `export const colorPrimary = "...";` |
| `tailwind` | Config `theme.extend` de Tailwind | `colors: { primary: "..." }`         |

Opciones disponibles:

| Opción              | Descripción                                  |
| ------------------- | -------------------------------------------- |
| `--output, -o`      | Ruta del archivo de salida (default: stdout) |
| `--prefix`          | Prefijo para nombres de variables CSS/SCSS   |
| `--no-descriptions` | Omitir comentarios de descripción            |
| `--theme`           | Exportar un tema específico                  |

Para más detalles sobre el formato, consulta la [referencia del formato de tokens](/es/reference/token-format).
