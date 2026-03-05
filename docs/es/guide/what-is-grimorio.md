---
title: Qué es grimorio
---

# Qué es grimorio

grimorio es el lugar donde se definen los acuerdos de un sistema de diseño, y el tooling para reforzarlos en ambos lados: diseño y desarrollo. El **component spec** es el contrato central.

grimorio conecta diseño y desarrollo usando specs de componentes como un contrato compartido. Los specs definen qué es un componente (props, variantes, token mappings, anatomía, accesibilidad, lineamientos) y grimorio valida que tanto el código como el diseño se mantengan consistentes con ese contrato.

Soporta componentes React y Vue.

## Filosofía

grimorio se construye sobre tres principios fundamentales.

### AI-opcional

El flujo de trabajo principal -- definir specs, inferirlos del código y validar implementaciones -- es completamente determinístico. Usa análisis estático y validación basada en reglas. Ningún comando de grimorio necesita API key.

El razonamiento AI viene de clientes externos (Claude, Cursor, Windsurf) a través del [servidor MCP](/es/guide/mcp), no de grimorio. Esto significa que puedes usar grimorio sin ninguna AI, o conectarlo a tu cliente AI preferido para enriquecer specs, generar código y auditar accesibilidad.

### Spec como contrato

El spec es la fuente de verdad. No Figma, no el código. Ambos lados validan contra el spec. Esto evita la deriva entre lo que diseño define y lo que desarrollo implementa.

### Adopción progresiva

Un equipo puede empezar con `init` + `add` + `validate` sin necesidad de API key. Los flujos asistidos por AI se agregan después conectando el servidor MCP. No hay lock-in a ningún proveedor de AI.

## Dos formas de usar grimorio

grimorio tiene dos interfaces que comparten el mismo motor pero sirven para cosas distintas. Para una comparación detallada, consulta [Flujos AI-Friendly](/es/guide/ai).

### Servidor MCP -- para desarrollo interactivo con AI

Conecta el servidor MCP a tu cliente AI (Claude, Cursor, Windsurf, etc.) y la AI obtiene acceso estructurado a todo tu sistema de diseño. Este es el flujo recomendado cuando trabajas con un asistente AI.

La AI puede enriquecer specs con accesibilidad, generar componentes desde specs, auditar tu sistema de diseño, validar código y responder preguntas sobre tus tokens y componentes. grimorio proporciona los datos y herramientas; la AI proporciona el razonamiento.

```bash
npx grimorio mcp:serve
```

El servidor expone **16 herramientas**, **4 prompts** y **2 recursos**. Consulta [Servidor MCP](/es/guide/mcp) para configuración.

### CLI -- para automatización, CI/CD y uso independiente

Todos los comandos de grimorio son determinísticos y funcionan sin API key. Usa el CLI cuando estés automatizando tareas, ejecutando validación en CI, exportando tokens para tu pipeline de build, o simplemente prefieras trabajar sin AI.

```bash
npx grimorio validate --level strict # validar en CI
npx grimorio tokens:export css       # exportar para pipeline de build
npx grimorio figma:import <url>      # importar desde Figma
npx grimorio add Button              # crear spec desde un preset
npx grimorio validate --watch        # watch mode durante desarrollo
```

Consulta la [Referencia del CLI](/es/reference/cli) para los 10 comandos.

::: tip ¿Cuándo usar cuál?
**¿Trabajas con un asistente AI?** Usa MCP -- puede hacer todo lo que hace el CLI, más razonar sobre tu sistema de diseño. **¿Automatizando o scripting?** Usa el CLI -- es determinístico y compatible con CI. Consulta la [comparación completa](/es/guide/ai) para más detalles.
:::

## Arquitectura

grimorio es un monorepo pnpm con 5 paquetes ESM-only. El grafo de dependencias es:

```
core
├── analyzers (-> core)
│   └── validators (-> core, analyzers)
├── mcp (-> core, analyzers, validators)
└── cli (-> todos los paquetes, el único paquete público)
```

### core

Schemas Zod para `ComponentSpec` y tokens de diseño W3C, loaders de archivos, tipo `Result<T, E>`, generación de JSON Schema. Incluye presets de componentes (10 componentes comunes) y presets de tokens (13 categorías W3C DTCG). Exportadores de tokens a CSS, SCSS, JS y Tailwind.

### analyzers

Análisis estático de componentes React (oxc-parser) y Vue (@vue/compiler-sfc). Extrae props, variantes cva(), clases Tailwind, atributos de accesibilidad e imports/exports. Devuelve un `AnalyzedComponent`.

### validators

Valida un `AnalyzedComponent` contra un `ComponentSpec` en tres niveles: basic, standard y strict. Tres sub-validadores: estructura, tokens y accesibilidad.

### mcp

Servidor MCP que expone 16 herramientas, 4 prompts y 2 recursos para integración con asistentes AI. Permite que Claude u otros agentes consulten y modifiquen el sistema de diseño directamente.

### cli

CLI basado en citty. Es el único paquete público (`grimorio`). 10 comandos que orquestan todos los demás paquetes. Configuración via c12 (`grimorio.config.ts`) con validación Zod.

## Siguiente paso

Si quieres empezar a usar grimorio, ve a [Primeros pasos](/es/guide/getting-started).
