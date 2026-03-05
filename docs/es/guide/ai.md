---
title: Flujos AI-Friendly
---

# Flujos AI-Friendly

grimorio es **AI-friendly pero AI-opcional**. Expone toda su funcionalidad via MCP para que cualquier cliente AI pueda usarlo, pero nunca requiere AI para funcionar. Sin API keys, sin adaptadores AI, sin dependencias de SDKs.

## CLI vs MCP: cuándo usar cada uno

grimorio tiene dos interfaces -- el CLI y el servidor MCP. Comparten el mismo motor, pero sirven para casos de uso diferentes.

### Usa el servidor MCP cuando...

Estás **trabajando interactivamente con un asistente AI** (Claude, Cursor, Windsurf, etc.). El servidor MCP le da a la AI acceso estructurado a todo tu sistema de diseño. La AI puede leer specs, consultar tokens, validar código y tomar acciones -- todo dentro de la conversación.

Este es el flujo recomendado para:

- **Enriquecer specs** -- la AI razona sobre accesibilidad, tokens y lineamientos, y luego escribe el spec enriquecido
- **Generar componentes** -- la AI lee el spec, revisa los tokens, genera el código y lo valida
- **Explorar el sistema de diseño** -- la AI responde preguntas como "¿qué componentes usan `color.primary`?" o "¿cuáles son los lineamientos de Button?"
- **Auditar** -- la AI revisa accesibilidad o la salud general del sistema y sugiere mejoras
- **Actualizar specs** -- la AI puede crear o modificar specs según tus instrucciones

En todos estos casos, **grimorio proporciona datos determinísticos y herramientas; la AI proporciona el razonamiento**. grimorio nunca llama a un modelo AI internamente.

### Usa el CLI cuando...

Estás **automatizando tareas**, ejecutando cosas en **CI/CD**, o trabajando **sin un asistente AI**.

Es la opción correcta para:

- **Validación en CI/CD** -- `grimorio validate` y `grimorio tokens:validate` terminan con código 1 si hay errores
- **Exportar tokens** -- `grimorio tokens:export css` genera CSS custom properties para tu pipeline de build
- **Importar desde Figma** -- `grimorio figma:import` mapea propiedades de Figma a specs de forma determinística
- **Scaffolding** -- `grimorio init` y `grimorio add` inicializan proyectos y crean specs desde presets
- **Inferir specs** -- `grimorio spec:infer` analiza código existente con análisis estático
- **Modo watch** -- `grimorio validate --watch` re-valida automáticamente al detectar cambios durante el desarrollo

Todos los comandos del CLI son determinísticos y no necesitan API key.

### Comparación lado a lado

| Escenario                           | CLI                                    | MCP                                                |
| ----------------------------------- | -------------------------------------- | -------------------------------------------------- |
| Validar en CI                       | `npx grimorio validate --level strict` | --                                                 |
| Exportar tokens a CSS               | `npx grimorio tokens:export css`       | herramienta `export_tokens`                        |
| Importar spec desde Figma           | `npx grimorio figma:import <url>`      | herramienta `import_from_figma`                    |
| Enriquecer un spec con a11y         | --                                     | AI usa prompt `enrich-spec` + herramientas         |
| Generar código de un componente     | --                                     | AI usa prompt `generate-component` + herramientas  |
| Revisar salud del sistema de diseño | --                                     | AI usa prompt `review-system` + herramientas       |
| Auditar accesibilidad               | --                                     | AI usa prompt `audit-accessibility` + herramientas |
| "¿Qué componentes usan este token?" | --                                     | AI consulta `get_tokens` + `list_components`       |
| Watch mode durante desarrollo       | `npx grimorio validate --watch`        | --                                                 |
| Crear spec desde un preset          | `npx grimorio add Button`              | herramienta `add_component`                        |

Las celdas con `--` son importantes: las tareas que requieren razonamiento (enriquecer, generar, auditar) **solo están disponibles via MCP**, porque el razonamiento viene del cliente AI. Las tareas que no necesitan razonamiento funcionan en ambos, pero el CLI es más simple para automatización.

## Cómo funciona el flujo MCP

En vez de incluir adaptadores AI, grimorio expone **prompts MCP** (skills) que contienen conocimiento de dominio. Tu cliente AI lee el prompt y usa las herramientas de grimorio para ejecutar el workflow.

### Ejemplo: enriquecer un spec

Dile a tu AI: _"Usa el prompt enrich-spec para mi componente Button"_

La AI:

1. Llama `get_component("Button")` para leer el spec actual
2. Llama `get_tokens()` para ver los tokens disponibles
3. Razona sobre accesibilidad, tokens y lineamientos
4. Llama `update_spec("Button", specEnriquecido)` para guardar el resultado

### Ejemplo: generar un componente

Dile a tu AI: _"Genera un componente React desde el spec de Card usando Tailwind"_

La AI:

1. Llama `get_component("Card")` para obtener el spec
2. Llama `get_component_guidelines("Card")` para el checklist
3. Llama `get_tokens()` para los valores de tokens
4. Genera el código usando su propio razonamiento
5. Llama `validate_usage` para verificar el resultado

## Prompts disponibles

| Prompt                | Descripción                                                 |
| --------------------- | ----------------------------------------------------------- |
| `enrich-spec`         | Enriquecer un spec con accesibilidad, tokens y lineamientos |
| `generate-component`  | Generar código de componente desde un spec                  |
| `review-system`       | Revisar la salud general del sistema de diseño              |
| `audit-accessibility` | Auditar la accesibilidad de un componente (WAI-ARIA)        |

## Configuración

Conecta el servidor MCP a tu cliente AI. Ver [Servidor MCP](/es/guide/mcp) para detalles de configuración.

::: tip Consejo
No necesitas configurar nada de AI en grimorio. Solo conecta el servidor MCP y tu cliente AI se encarga del resto.
:::
