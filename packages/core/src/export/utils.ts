import type { DesignToken, TokenGroup } from "../schemas/design-tokens.js";
import { flattenTokens, resolveTokenReference } from "../loaders/token-loader.js";

export function formatTokenValue(value: DesignToken["$value"]): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return `cubic-bezier(${value.join(", ")})`;
  }
  const obj = value;

  // Shadow: { offsetX, offsetY, blur, spread?, color }
  if ("offsetX" in obj && "offsetY" in obj && "blur" in obj && "color" in obj) {
    const parts = [obj.offsetX, obj.offsetY, obj.blur];
    if (obj.spread && obj.spread !== "0px") parts.push(obj.spread);
    parts.push(obj.color);
    return parts.join(" ");
  }

  // Border: { width, style, color }
  if ("width" in obj && "style" in obj && "color" in obj) {
    return `${obj.width} ${obj.style} ${obj.color}`;
  }

  // Transition: { property?, duration, timingFunction?, delay? }
  if ("duration" in obj && ("timingFunction" in obj || "delay" in obj)) {
    const parts = [obj.property ?? "all", obj.duration];
    if (obj.timingFunction) parts.push(obj.timingFunction);
    if (obj.delay) parts.push(obj.delay);
    return parts.join(" ");
  }

  // Gradient: { type, stops[] }
  if ("type" in obj && "stops" in obj && Array.isArray(obj.stops)) {
    const stops = (obj.stops as Array<{ color: string; position?: string }>)
      .map((s) => (s.position ? `${s.color} ${s.position}` : s.color))
      .join(", ");
    return `${obj.type}-gradient(${stops})`;
  }

  // StrokeStyle: { dashArray, lineCap }
  if ("dashArray" in obj && "lineCap" in obj) {
    const arr = obj.dashArray;
    return Array.isArray(arr) ? arr.join(" ") : String(arr);
  }

  // Typography and other objects: no useful CSS shorthand
  return JSON.stringify(value);
}

function isTokenReference(value: unknown): value is string {
  return typeof value === "string" && /^\{[^}]+\}$/.test(value);
}

function resolveDeep(
  value: string,
  tokens: TokenGroup,
  visited: Set<string>,
  maxDepth: number,
): DesignToken["$value"] {
  if (maxDepth <= 0) return value;
  const path = value.replace(/^\{|\}$/g, "");
  if (visited.has(path)) return value; // circular
  visited.add(path);

  const resolved = resolveTokenReference(path, tokens);
  if (!resolved.ok) return value;

  const resolvedValue = resolved.value.$value;
  if (isTokenReference(resolvedValue)) {
    return resolveDeep(resolvedValue, tokens, visited, maxDepth - 1);
  }
  return resolvedValue;
}

export interface FlattenOptions {
  resolveReferences?: boolean;
}

export function flattenWithTypes(
  tokens: TokenGroup,
  options: FlattenOptions = {},
): Map<string, DesignToken & { $type?: string }> {
  const { resolveReferences = true } = options;
  const flat = flattenTokens(tokens);
  const result = new Map<string, DesignToken & { $type?: string }>();

  for (const [path, token] of flat) {
    let resolved = token;

    // Resolve token references
    if (resolveReferences && isTokenReference(token.$value)) {
      const resolvedValue = resolveDeep(token.$value, tokens, new Set(), 10);
      resolved = { ...token, $value: resolvedValue };
    }

    if (resolved.$type) {
      result.set(path, resolved);
      continue;
    }
    // Propagate $type from parent group
    const segments = path.split(".");
    let group: TokenGroup | undefined = tokens;
    let parentType: string | undefined;
    for (let i = 0; i < segments.length - 1; i++) {
      const child = group[segments[i]];
      if (child && typeof child === "object" && !("$value" in child)) {
        group = child as TokenGroup;
        if (group.$type) parentType = group.$type;
      } else {
        break;
      }
    }
    result.set(path, parentType ? { ...resolved, $type: parentType } : resolved);
  }

  return result;
}

export function toKebab(path: string, prefix?: string): string {
  const parts = prefix ? [prefix, ...path.split(".")] : path.split(".");
  return parts.join("-");
}

export function toCamelCase(path: string): string {
  return path
    .split(".")
    .map((part, i) =>
      i === 0
        ? part.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())
        : part.charAt(0).toUpperCase() +
          part.slice(1).replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()),
    )
    .join("");
}

export function escapeJsString(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");
}

export function escapeCssComment(value: string): string {
  return value.replace(/\*\//g, "* /");
}

export function escapeScssComment(value: string): string {
  return value.replace(/[\r\n]+/g, " ");
}
