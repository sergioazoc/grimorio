import type { TokenGroup } from "../schemas/design-tokens.js";
import type { ExportOptions, TokenExporter } from "./types.js";
import type { Result } from "../result.js";
import { ok } from "../result.js";
import { flattenWithTypes, formatTokenValue, toKebab, escapeCssComment } from "./utils.js";

function buildCssBlock(
  tokens: TokenGroup,
  selector: string,
  options: ExportOptions = {},
): string[] {
  const { prefix, includeDescriptions = true } = options;
  const flat = flattenWithTypes(tokens);
  const lines: string[] = [`${selector} {`];

  for (const [path, token] of flat) {
    if (includeDescriptions && token.$description) {
      lines.push(`  /* ${escapeCssComment(token.$description)} */`);
    }
    lines.push(`  --${toKebab(path, prefix)}: ${formatTokenValue(token.$value)};`);
  }

  lines.push("}");
  return lines;
}

export const exportCss: TokenExporter = (tokens, options = {}) => {
  const lines = buildCssBlock(tokens, ":root", options);
  return ok(lines.join("\n") + "\n");
};

export function exportCssThemed(
  themes: Map<string, TokenGroup>,
  options?: ExportOptions,
): Result<string, string> {
  const blocks: string[] = [];

  for (const [name, tokens] of themes) {
    const selector = name === "default" ? ":root" : `[data-theme="${name}"]`;
    blocks.push(...buildCssBlock(tokens, selector, options));
  }

  return ok(blocks.join("\n") + "\n");
}
