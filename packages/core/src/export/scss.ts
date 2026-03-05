import type { TokenExporter } from "./types.js";
import { ok } from "../result.js";
import { flattenWithTypes, formatTokenValue, toKebab, escapeScssComment } from "./utils.js";

export const exportScss: TokenExporter = (tokens, options = {}) => {
  const { prefix, includeDescriptions = true } = options;
  const flat = flattenWithTypes(tokens);
  const lines: string[] = [];

  for (const [path, token] of flat) {
    if (includeDescriptions && token.$description) {
      lines.push(`// ${escapeScssComment(token.$description)}`);
    }
    lines.push(`$${toKebab(path, prefix)}: ${formatTokenValue(token.$value)};`);
  }

  return ok(lines.join("\n") + "\n");
};
