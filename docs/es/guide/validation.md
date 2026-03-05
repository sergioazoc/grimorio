---
title: Validación
---

# Validación

grimorio valida que las implementaciones de componentes cumplan con sus specs. La validación es completamente determinística: usa análisis estático y reglas, sin AI.

## Ejecutar validación

```bash
# Validar todos los componentes contra sus specs
grimorio validate

# Especificar nivel de validación
grimorio validate --level strict

# Modo watch: re-valida automáticamente al detectar cambios
grimorio validate --watch
grimorio validate --watch --level strict
```

El comando busca archivos de componentes según el patrón `components` de la configuración, los analiza estáticamente y los compara contra los specs que coincidan por nombre (comparación case-insensitive).

Si hay errores de validación, el comando termina con código de salida 1 (excepto en modo watch).

## Los tres niveles de validación

grimorio tiene tres niveles de validación, cada uno más estricto que el anterior.

### basic

Verifica lo mínimo necesario:

- Props requeridas están presentes en la implementación

### standard (default)

Todo lo de `basic`, más:

- Variantes definidas en el spec están implementadas
- No hay valores de tokens hardcodeados (se usan los tokens del sistema)
- Atributos ARIA declarados en el spec están presentes

### strict

Todo lo de `standard`, más:

- No hay props extra que no estén en el spec
- No hay variantes extra que no estén en el spec
- Las partes de la anatomía (`anatomy`) están implementadas
- Todas las interacciones de teclado declaradas están implementadas

| Nivel      | Props requeridas | Variantes | Tokens | ARIA | Extras | Parts | Teclado |
| ---------- | :--------------: | :-------: | :----: | :--: | :----: | :---: | :-----: |
| `basic`    |        Sí        |           |        |      |        |       |         |
| `standard` |        Sí        |    Sí     |   Sí   |  Sí  |        |       |         |
| `strict`   |        Sí        |    Sí     |   Sí   |  Sí  |   Sí   |  Sí   |   Sí    |

::: tip Consejo
Empieza con `basic` o `standard` al principio. Sube a `strict` cuando el equipo esté listo para mantener specs completos y detallados.
:::

## Configurar el nivel por defecto

En `grimorio.config.ts`:

```ts
export default {
  validation: {
    level: "standard", // "basic" | "standard" | "strict"
  },
};
```

El flag `--level` del CLI sobreescribe la configuración.

## Modo watch

El modo watch observa cambios en archivos de specs y componentes, y re-ejecuta la validación automáticamente:

```bash
grimorio validate --watch
```

Usa `fs.watch` con un debounce de 300ms para evitar ejecuciones innecesarias durante ediciones rápidas.

::: info Info
En modo watch, los errores de validación se reportan pero no terminan el proceso. El proceso sigue corriendo hasta que lo detengas con Ctrl+C.
:::

## Sub-validadores

Internamente, la validación se divide en tres sub-validadores:

### Estructura

Compara la estructura del componente analizado contra el spec: props, variantes, slots, dependencias y anatomía.

### Tokens

Verifica que el componente use tokens del sistema de diseño en lugar de valores hardcodeados. Por ejemplo, detecta si hay un color `#3b82f6` en el código que debería ser un token `color.primary`.

### Accesibilidad

Verifica que los atributos ARIA declarados en el spec estén presentes en la implementación, y que las interacciones de teclado estén implementadas (en nivel strict).

## Validación de tokens

Además de la validación de componentes, grimorio puede validar los tokens mismos:

```bash
grimorio tokens:validate
grimorio tokens:validate --watch
```

Esta validación realiza tres verificaciones:

### 1. Validación de schema

Valida que el archivo de tokens cumpla con `TokenFileSchema` (formato W3C DTCG). Reporta errores de estructura.

### 2. Estadísticas

Cuenta los tokens por `$type`, reporta el total y la cantidad de tokens deprecados.

### 3. Referencia cruzada

Compara los tokens con los specs de componentes:

| Tipo           | Nivel       | Descripción                                        |
| -------------- | ----------- | -------------------------------------------------- |
| **Missing**    | Error       | Token referenciado en un spec pero no definido     |
| **Deprecated** | Advertencia | Token deprecado todavía en uso en un spec          |
| **Orphan**     | Info        | Token definido pero no referenciado en ningún spec |

El comando termina con código 1 si hay errores de schema o tokens faltantes.

::: warning Advertencia
Si usas configuración multi-tema, `tokens:validate` valida **todos** los temas. Un error en cualquier tema causa que falle la validación.
:::

## Ejemplo de salida

```
Validating components...

  Button (src/components/Button.tsx)
    [pass] Required props present
    [pass] Variants implemented
    [warn] Hardcoded color value #3b82f6 (should use token color.primary)
    [pass] ARIA attributes present

  1 warning, 0 errors

Validating tokens...

  Schema: valid
  Tokens: 42 total (18 color, 8 spacing, 6 fontSize, ...)
  Deprecated: 2

  Cross-reference:
    [error] Missing: color.accent (referenced in Card spec)
    [warn] Deprecated: color.old-primary (used in Badge spec)
    [info] Orphan: spacing.3xl (not referenced in any spec)

  1 error, 1 warning
```
