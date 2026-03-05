---
title: Primeros pasos
---

# Primeros pasos

## Instalación

Agrega grimorio como dependencia de desarrollo de tu proyecto:

```bash
pnpm add -D grimorio
```

::: tip Consejo
También puedes instalarlo de forma global (`npm install -g grimorio`) o usar `npx grimorio` sin instalar. Una dependencia local es la opción recomendada para que la versión quede fija en el proyecto.
:::

## Inicializar el proyecto

```bash
npx grimorio init
```

`grimorio init` crea:

- `grimorio.config.ts` -- archivo de configuración del proyecto
- `specs/` -- directorio para los specs de componentes
- `tokens.json` -- archivo de tokens de diseño con el set completo por defecto (13 categorías W3C DTCG)

## Tres caminos para empezar

Dependiendo de tu situación, puedes elegir el camino que mejor se adapte.

### Camino 1: Inferir specs de código existente

Si ya tienes componentes implementados, grimorio puede analizar el código fuente y generar un spec automáticamente.

```bash
# Inferir un spec desde un componente React o Vue
npx grimorio spec:infer src/components/Button.tsx

# Especificar el archivo de salida
npx grimorio spec:infer src/components/Modal.vue -o specs/modal.json

# Validar que el código cumple con los specs
npx grimorio validate
```

El comando `spec:infer` usa análisis estático para extraer props, variantes, atributos de accesibilidad y clases Tailwind del componente.

### Camino 2: Empezar de cero con presets

Si vas a definir los componentes antes de implementarlos, puedes usar los presets integrados.

```bash
# Crear un spec usando un preset integrado (auto-detecta el nombre)
npx grimorio add Button

# Preset con descripción personalizada
npx grimorio add Select -d "Selector de país"

# Crear un spec sin preset (genera un esqueleto mejorado)
npx grimorio add CustomWidget

# Ver presets disponibles
npx grimorio add --list-presets
```

Los 10 presets integrados son: `button`, `input`, `select`, `checkbox`, `dialog`, `card`, `avatar`, `badge`, `tabs` y `textarea`. Cada preset incluye props, variantes, accesibilidad y lineamientos predefinidos.

Una vez que tengas los specs, conecta el [servidor MCP](/es/guide/mcp) a tu cliente AI y usa el prompt `generate-component` para generar código desde el spec.

### Camino 3: Importar desde Figma

Si el diseño ya existe en Figma, puedes importar los specs directamente.

```bash
# Listar componentes disponibles en un archivo Figma
npx grimorio figma:import "https://figma.com/design/ABC/..."

# Importar un componente específico
npx grimorio figma:import "https://figma.com/design/ABC/..." --component Button
```

El comando `figma:import` mapea las propiedades de Figma a specs de forma determinística. Después de importar, conecta el [servidor MCP](/es/guide/mcp) y usa el prompt `enrich-spec` para agregar accesibilidad y lineamientos. Consulta la [guía de Figma](/es/guide/figma) para más detalles.

## Configuración básica

El archivo `grimorio.config.ts` en la raíz del proyecto controla el comportamiento de grimorio:

```ts
export default {
  specs: "./specs/**/*.json",
  tokens: "./tokens.json",
  components: "./src/components/**/*.{tsx,vue}",
  validation: {
    level: "standard",
  },
};
```

Para configuración completa, consulta la [referencia de configuración](/es/reference/configuration).

## Flujo de trabajo típico

1. **Definir** el spec del componente (manual, preset, inferido o importado de Figma)
2. **Validar** que la implementación cumple con el spec: `grimorio validate`
3. **Iterar** sobre el spec y la implementación hasta que estén alineados
4. **Opcional**: Usar `npx grimorio validate --watch` para validación continua durante el desarrollo

::: tip Consejo
No necesitas configurar nada de AI en grimorio. Los comandos del CLI funcionan sin API key. Para flujos asistidos por AI, conecta el [servidor MCP](/es/guide/mcp) a tu cliente AI preferido.
:::

## Conectar tu asistente AI (opcional)

Una vez que tengas specs y tokens configurados, puedes conectar el servidor MCP a tu cliente AI. Esto habilita flujos asistidos por AI como enriquecer specs, generar componentes y auditar accesibilidad -- sin configurar ninguna API key en grimorio.

```bash
npx grimorio mcp:serve
```

O agrégalo a la configuración de tu cliente MCP (consulta [Servidor MCP](/es/guide/mcp) para detalles):

```json
{
  "mcpServers": {
    "grimorio": {
      "command": "npx",
      "args": ["grimorio", "mcp:serve"]
    }
  }
}
```

Consulta [Flujos AI-Friendly](/es/guide/ai) para una comparación detallada de cuándo usar el CLI vs MCP.

## Siguientes pasos

- [Component Specs](/es/guide/component-specs) -- Entender la estructura de un spec
- [Design Tokens](/es/guide/design-tokens) -- Formato W3C DTCG y exportación
- [Flujos AI-Friendly](/es/guide/ai) -- CLI vs MCP: cuándo usar cada uno
- [Servidor MCP](/es/guide/mcp) -- Configuración y herramientas disponibles
- [Validación](/es/guide/validation) -- Los tres niveles de validación
- [Referencia del CLI](/es/reference/cli) -- Todos los comandos y opciones
