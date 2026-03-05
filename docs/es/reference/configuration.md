---
title: Configuración
---

# Configuración

grimorio se configura con un archivo `grimorio.config.ts` en la raíz del proyecto. El archivo se carga usando [c12](https://github.com/unjs/c12) y se valida con un schema Zod.

## Archivo de configuración

```ts
export default {
  specs: "./specs/**/*.json",
  tokens: "./tokens.json",
  components: "./src/components/**/*.{tsx,vue}",
  validation: {
    level: "standard",
  },
  figma: {
    token: undefined,
  },
};
```

::: tip Consejo
El comando `grimorio init` genera este archivo automáticamente con los valores por defecto.
:::

## Campos

### `specs`

- **Tipo**: `string`
- **Default**: `"./specs/**/*.json"`

Patrón glob para encontrar los archivos de specs de componentes.

```ts
export default {
  specs: "./specs/**/*.json",
};
```

### `tokens`

- **Tipo**: `string | Record<string, string>`
- **Default**: `"./tokens.json"`

Ruta al archivo de tokens de diseño. Para soporte multi-tema, usa un objeto con los nombres de los temas como claves:

```ts
// Un solo archivo
export default {
  tokens: "./tokens.json",
};

// Multi-tema
export default {
  tokens: {
    default: "./tokens.json",
    dark: "./tokens-dark.json",
    highContrast: "./tokens-high-contrast.json",
  },
};
```

Cuando se usa configuración multi-tema:

- `tokens:validate` valida **todos** los temas
- `tokens:list` muestra el tema `default`; usa `--theme` para otro
- `tokens:export css` (sin `--theme`) genera todos los temas en un archivo
- `tokens:export scss|js|tailwind` requiere `--theme` para elegir tema
- `mcp:serve` usa el tema `default`

### `components`

- **Tipo**: `string`
- **Default**: `"./src/components/**/*.{tsx,vue}"`

Patrón glob para encontrar los archivos de componentes a validar. Soporta archivos React (`.tsx`) y Vue (`.vue`).

```ts
export default {
  components: "./src/components/**/*.{tsx,vue}",
};
```

### `validation`

- **Tipo**: `{ level?: "basic" | "standard" | "strict" }`
- **Default**: `{ level: "standard" }`

Configuración de validación.

```ts
export default {
  validation: {
    level: "strict",
  },
};
```

El nivel se puede sobreescribir con el flag `--level` del CLI.

### `figma`

- **Tipo**: `{ token?: string }`
- **Default**: `{}`

Configuración para la integración con Figma.

```ts
export default {
  figma: {
    token: undefined, // o "figd_..."
  },
};
```

El token se resuelve en este orden de prioridad:

1. Flag `--token` del CLI
2. Campo `figma.token` en la configuración
3. Variable de entorno `FIGMA_TOKEN`

### `root`

- **Tipo**: `string`
- **Default**: directorio del proyecto

Directorio raíz del proyecto. Normalmente no es necesario configurarlo.

## Comportamiento de validación

El archivo de configuración se valida con un schema Zod que usa `.strip()`:

- **Campos desconocidos** se eliminan silenciosamente (no causan error)
- **Valores inválidos** emiten un `consola.warn` y se usan los valores por defecto
- Si toda la configuración es inválida, se usan los defaults completos

Ejemplo: si `validation.level` tiene un valor inválido como `"extreme"`, grimorio muestra una advertencia y usa `"standard"`.

## Configuración completa de ejemplo

```ts
export default {
  specs: "./design-system/specs/**/*.json",
  tokens: {
    default: "./design-system/tokens/base.json",
    dark: "./design-system/tokens/dark.json",
  },
  components: "./src/ui/**/*.{tsx,vue}",
  validation: {
    level: "strict",
  },
  figma: {
    // Token configurado via FIGMA_TOKEN env var
  },
};
```

## Helper defineConfig

grimorio exporta un helper `defineConfig` para obtener autocompletado en el editor:

```ts
import { defineConfig } from "grimorio";

export default defineConfig({
  specs: "./specs/**/*.json",
  tokens: "./tokens.json",
  validation: {
    level: "standard",
  },
});
```

::: info Info
El template generado por `grimorio init` usa `export default` sin importar `defineConfig`, porque al momento del init el paquete `grimorio` podría no estar instalado como dependencia local.
:::
