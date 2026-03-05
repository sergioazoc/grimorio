import type { TokenExporter } from "./types.js";
import { ok } from "../result.js";
import {
  flattenWithTypes,
  formatTokenValue,
  toCamelCase,
  escapeJsString,
  escapeCssComment,
} from "./utils.js";

export const exportJs: TokenExporter = (tokens, options = {}) => {
  const { includeDescriptions = true } = options;
  const flat = flattenWithTypes(tokens);
  const lines: string[] = [];

  for (const [path, token] of flat) {
    if (includeDescriptions && token.$description) {
      lines.push(`/** ${escapeCssComment(token.$description)} */`);
    }
    const value = formatTokenValue(token.$value);
    const isNumeric = typeof token.$value === "number" || typeof token.$value === "boolean";
    const exported = isNumeric ? value : `"${escapeJsString(value)}"`;
    lines.push(`export const ${toCamelCase(path)} = ${exported};`);
  }

  return ok(lines.join("\n") + "\n");
};
