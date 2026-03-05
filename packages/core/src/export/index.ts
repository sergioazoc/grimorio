export type { ExportFormat, ExportOptions, TokenExporter } from "./types.js";
export { formatTokenValue, flattenWithTypes } from "./utils.js";
export type { FlattenOptions } from "./utils.js";
export { exportCss, exportCssThemed } from "./css.js";
export { exportScss } from "./scss.js";
export { exportJs } from "./js.js";
export { exportTailwind } from "./tailwind.js";

import type { TokenGroup } from "../schemas/design-tokens.js";
import type { ExportFormat, ExportOptions } from "./types.js";
import type { Result } from "../result.js";
import { err } from "../result.js";
import { exportCss } from "./css.js";
import { exportScss } from "./scss.js";
import { exportJs } from "./js.js";
import { exportTailwind } from "./tailwind.js";

const exporters: Record<
  ExportFormat,
  (tokens: TokenGroup, options?: ExportOptions) => Result<string, string>
> = {
  css: exportCss,
  scss: exportScss,
  js: exportJs,
  tailwind: exportTailwind,
};

export function exportTokens(
  tokens: TokenGroup,
  format: string,
  options?: ExportOptions,
): Result<string, string> {
  const exporter = exporters[format as ExportFormat];
  if (!exporter) {
    return err(
      `Unknown export format: "${format}". Valid formats: ${Object.keys(exporters).join(", ")}`,
    );
  }
  return exporter(tokens, options);
}
