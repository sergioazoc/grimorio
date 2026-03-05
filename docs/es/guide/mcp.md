---
title: Servidor MCP
---

# Servidor MCP

grimorio incluye un servidor [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) que expone el sistema de diseño para que asistentes AI puedan consultarlo directamente. El servidor no usa AI internamente; proporciona acceso estructurado a los specs, tokens, validación y herramientas de acción.

## Iniciar el servidor

```bash
grimorio mcp:serve
```

El servidor se comunica via stdio, siguiendo el protocolo MCP estándar. Está diseñado para conectarse a clientes MCP como Claude Desktop, Claude Code, Cursor o Windsurf.

## Herramientas (16)

### Herramientas de lectura

| Herramienta                | Descripción                                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `list_components`          | Lista todos los componentes del sistema de diseño                                                                  |
| `get_component`            | Devuelve el spec completo de un componente por nombre                                                              |
| `get_component_source`     | Devuelve el código fuente de un componente                                                                         |
| `get_tokens`               | Devuelve los tokens de diseño con filtrado por `prefix` y `$type`. Incluye `$type`, `$description` y `$deprecated` |
| `validate_usage`           | Valida el uso de un componente contra su spec. Incluye una `suggestion` accionable por problema                    |
| `find_component`           | Busca componentes por nombre, descripción, categoría o lineamientos                                                |
| `get_component_guidelines` | Devuelve lineamientos como un checklist Markdown                                                                   |

### Herramientas de acción

| Herramienta          | Descripción                                                               |
| -------------------- | ------------------------------------------------------------------------- |
| `init_project`       | Inicializa grimorio en un proyecto (config, specs dir, tokens)            |
| `add_component`      | Crea un spec de componente desde un preset o esqueleto                    |
| `infer_spec`         | Infiere un spec desde código fuente via análisis estático                 |
| `validate_component` | Valida un archivo de componente contra su spec (lee el archivo del disco) |
| `validate_tokens`    | Valida schema de tokens + referencia cruzada con specs                    |
| `export_tokens`      | Exporta tokens a CSS, SCSS, JS o Tailwind                                 |
| `update_spec`        | Crea o actualiza un spec de componente (valida antes de escribir)         |
| `import_from_figma`  | Importa un spec de componente desde una URL de Figma                      |
| `validate_figma`     | Valida un componente de Figma contra un spec existente                    |

## Prompts / Skills (4)

Flujos de trabajo predefinidos que los clientes AI pueden seguir usando las herramientas de grimorio:

| Prompt                | Descripción                                                                |
| --------------------- | -------------------------------------------------------------------------- |
| `enrich-spec`         | Enriquecer un spec con accesibilidad, tokens y lineamientos                |
| `generate-component`  | Generar código de componente desde un spec                                 |
| `review-system`       | Revisar la salud general del sistema de diseño                             |
| `audit-accessibility` | Auditar la accesibilidad de un componente contra buenas prácticas WAI-ARIA |

Los prompts contienen conocimiento de dominio (qué hace un buen spec, patrones a11y, mapeo de tokens). El cliente AI lee el prompt y usa las herramientas de grimorio para ejecutar el flujo de trabajo.

## Recursos (2)

| Recurso                  | Descripción                                                          |
| ------------------------ | -------------------------------------------------------------------- |
| `design-system-overview` | Vista general del sistema de diseño: componentes, tokens, estructura |
| `implementation-guide`   | System prompt para agentes AI con reglas y flujo de trabajo          |

## Configuración del cliente

El servidor MCP funciona con cualquier cliente compatible. La configuración es la misma para todos -- usa `npx` para ejecutar grimorio desde la dependencia local de tu proyecto:

### Claude Desktop / Claude Code / Cursor / Windsurf

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

::: info Info
El servidor MCP lee tu `grimorio.config.ts` para encontrar specs y tokens. Asegúrate de tener la configuración lista antes de iniciar el servidor. Ejecuta `npx grimorio init` si aún no lo has hecho.
:::

## Ejemplo de uso

Una vez configurado, el agente AI puede hacer cosas como:

1. **Enriquecer specs** — usar el prompt `enrich-spec` para agregar accesibilidad, lineamientos y mapeo de tokens
2. **Generar componentes** — usar el prompt `generate-component` para crear código desde specs
3. **Revisar el sistema** — usar el prompt `review-system` para auditar la salud del sistema de diseño
4. **Auditar accesibilidad** — usar el prompt `audit-accessibility` para verificar cumplimiento WAI-ARIA
5. **Consultar specs y tokens** — acceder a specs y tokens directamente desde el editor
6. **Validar código** — verificar que la implementación cumple con los specs

Por ejemplo, si le pides a Claude "crea un formulario de login", el agente puede:

- Llamar a `list_components` para ver qué componentes hay
- Llamar a `get_component` para obtener los specs de Input y Button
- Llamar a `get_tokens` para obtener los colores y espaciados correctos
- Llamar a `get_component_guidelines` para verificar buenas prácticas
- Generar el código usando los specs y tokens reales del proyecto
- Llamar a `validate_usage` para verificar el resultado

::: info Info
El servidor MCP no requiere configuración de AI. Es una herramienta determinista que expone datos y acciones. La AI está del lado del cliente (Claude, Cursor, Windsurf, etc.), no del servidor.
:::
