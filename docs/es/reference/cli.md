---
title: Referencia del CLI
---

# Referencia del CLI

Referencia completa de todos los comandos del CLI de grimorio.

## grimorio init

Genera la estructura inicial del proyecto: archivo de configuración, directorio de specs y archivo de tokens con el set completo por defecto (13 categorías W3C DTCG).

```bash
grimorio init
```

Crea:

- `grimorio.config.ts` -- configuración del proyecto
- `specs/` -- directorio para specs de componentes
- `tokens.json` -- tokens de diseño por defecto

No tiene opciones adicionales.

---

## grimorio add

Crea un spec de componente. Si el nombre coincide con un preset integrado, genera un spec completo. Si no, genera un esqueleto mejorado con sección de accesibilidad incluida.

```bash
grimorio add <name>
```

### Opciones

| Opción           | Alias | Descripción                        |
| ---------------- | ----- | ---------------------------------- |
| `--preset`       | `-p`  | Usar un preset específico          |
| `--description`  | `-d`  | Descripción del componente         |
| `--category`     | `-c`  | Categoría del componente           |
| `--list-presets` |       | Listar presets disponibles y salir |

### Presets disponibles

`button`, `input`, `select`, `checkbox`, `dialog`, `card`, `avatar`, `badge`, `tabs`, `textarea`

### Ejemplos

```bash
# Auto-detecta el preset por nombre
grimorio add Button

# Preset con descripción personalizada
grimorio add Select -d "Selector de país"

# Componente sin preset (esqueleto mejorado)
grimorio add CustomWidget

# Forzar un preset específico
grimorio add Dialog -p dialog

# Ver presets disponibles
grimorio add --list-presets
```

---

## grimorio spec:infer

Analiza un archivo de componente (React o Vue) y genera un spec JSON a partir de él. Usa análisis estático para extraer props, variantes (cva), atributos de accesibilidad, clases Tailwind y dependencias.

```bash
grimorio spec:infer <file>
```

### Opciones

| Opción     | Alias | Descripción                         |
| ---------- | ----- | ----------------------------------- |
| `--output` | `-o`  | Ruta del archivo de salida del spec |

### Ejemplos

```bash
grimorio spec:infer src/components/Button.tsx
grimorio spec:infer src/components/Modal.vue -o specs/modal.json
```

---

## grimorio validate

Valida todos los componentes contra sus specs y tokens de diseño.

```bash
grimorio validate
```

### Opciones

| Opción    | Alias | Descripción                                        |
| --------- | ----- | -------------------------------------------------- |
| `--level` |       | Nivel de validación: `basic`, `standard`, `strict` |
| `--watch` | `-w`  | Modo watch: re-valida al detectar cambios          |

### Niveles de validación

| Nivel      | Verificaciones                                           |
| ---------- | -------------------------------------------------------- |
| `basic`    | Props requeridas                                         |
| `standard` | + variantes, tokens hardcodeados, atributos ARIA         |
| `strict`   | + props/variantes extra, anatomía, interacciones teclado |

### Ejemplos

```bash
grimorio validate
grimorio validate --level strict
grimorio validate --watch
grimorio validate --watch --level strict
```

Termina con código 1 si hay errores (excepto en modo watch).

---

## grimorio figma:import

Importa specs de componentes desde Figma. Mapea propiedades de Figma a props, variantes, slots, token mappings, anatomía, estados y eventos de forma determinística.

```bash
grimorio figma:import <url>
```

### Opciones

| Opción        | Alias | Descripción                                             |
| ------------- | ----- | ------------------------------------------------------- |
| `--component` |       | Nombre del componente a buscar en el archivo            |
| `--token`     |       | Token de la API de Figma (o usar `FIGMA_TOKEN` env var) |
| `--output`    | `-o`  | Ruta de salida del spec                                 |

### Ejemplos

```bash
# Listar componentes disponibles
grimorio figma:import "https://figma.com/design/ABC/..."

# Importar componente específico
grimorio figma:import "https://figma.com/design/ABC/..." --component Button

# Importar por node-id
grimorio figma:import "https://figma.com/design/ABC/...?node-id=1-234"

# Especificar salida
grimorio figma:import "https://figma.com/design/ABC/..." --component Button -o specs/button.json
```

Requiere token de Figma.

---

## grimorio figma:validate

Valida un componente de Figma contra un spec existente. Reporta diferencias en props, variantes, token mappings, slots, anatomía, estados y eventos.

```bash
grimorio figma:validate <url>
```

### Opciones

| Opción        | Descripción                                             |
| ------------- | ------------------------------------------------------- |
| `--component` | Nombre del componente a validar                         |
| `--token`     | Token de la API de Figma (o usar `FIGMA_TOKEN` env var) |
| `--json`      | Salida en formato JSON                                  |

### Ejemplos

```bash
grimorio figma:validate "https://figma.com/design/ABC/..." --component Button
grimorio figma:validate "https://figma.com/design/ABC/..." --component Button --json
```

Termina con código 1 si hay diferencias. Requiere token de Figma.

---

## grimorio tokens:list

Lista los tokens de diseño del proyecto.

```bash
grimorio tokens:list
```

### Opciones

| Opción    | Descripción                                    |
| --------- | ---------------------------------------------- |
| `--flat`  | Lista plana en lugar de vista de árbol         |
| `--type`  | Filtrar por `$type` (ej: `color`, `dimension`) |
| `--json`  | Salida en formato JSON                         |
| `--theme` | Tema a listar (para configs multi-tema)        |

### Ejemplos

```bash
grimorio tokens:list                     # vista de árbol (default)
grimorio tokens:list --flat              # lista plana con rutas completas
grimorio tokens:list --type color        # solo tokens de tipo color
grimorio tokens:list --json              # salida JSON
grimorio tokens:list --json --flat       # JSON plano
grimorio tokens:list --theme dark        # listar tema específico
```

---

## grimorio tokens:validate

Valida los tokens contra el schema W3C DTCG y hace referencia cruzada con los specs de componentes.

```bash
grimorio tokens:validate
```

### Opciones

| Opción    | Alias | Descripción                               |
| --------- | ----- | ----------------------------------------- |
| `--watch` | `-w`  | Modo watch: re-valida al detectar cambios |

### Verificaciones

1. **Schema** -- valida estructura contra `TokenFileSchema`
2. **Estadísticas** -- cuenta tokens por `$type`, reporta deprecados
3. **Referencia cruzada**:
   - **Missing** (error): referenciados en specs pero no definidos
   - **Deprecated** (advertencia): deprecados todavía en uso
   - **Orphans** (info): definidos pero no referenciados

### Ejemplos

```bash
grimorio tokens:validate
grimorio tokens:validate --watch
```

Termina con código 1 si hay errores de schema o tokens faltantes. Configs multi-tema validan todos los temas.

---

## grimorio tokens:export

Exporta tokens de diseño al formato especificado.

```bash
grimorio tokens:export <format>
```

Formatos disponibles: `css`, `scss`, `js`, `tailwind`.

### Opciones

| Opción              | Alias | Descripción                       |
| ------------------- | ----- | --------------------------------- |
| `--output`          | `-o`  | Ruta de salida (default: stdout)  |
| `--prefix`          |       | Prefijo para variables CSS/SCSS   |
| `--no-descriptions` |       | Omitir comentarios de descripción |
| `--theme`           |       | Exportar un tema específico       |

### Ejemplos

```bash
grimorio tokens:export css
grimorio tokens:export scss --prefix ds
grimorio tokens:export js --no-descriptions
grimorio tokens:export tailwind -o tailwind.tokens.js
grimorio tokens:export css --theme dark
```

Sin `--theme`, la exportación CSS genera todos los temas en un archivo (`:root` + `[data-theme="..."]`). Para SCSS, JS y Tailwind, usa `--theme` para exportar un tema específico.

---

## grimorio mcp:serve

Inicia un servidor MCP (Model Context Protocol) sobre stdio para integración con asistentes AI.

```bash
grimorio mcp:serve
```

No tiene opciones adicionales. Expone 16 herramientas, 4 prompts y 2 recursos. Consulta la [guía del servidor MCP](/es/guide/mcp) para detalles.

La AI está del lado del cliente MCP (Claude, Cursor, Windsurf, etc.), no del servidor.
