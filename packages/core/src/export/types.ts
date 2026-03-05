import type { TokenGroup } from "../schemas/design-tokens.js";
import type { Result } from "../result.js";

export type ExportFormat = "css" | "scss" | "js" | "tailwind";

export interface ExportOptions {
  prefix?: string;
  includeDescriptions?: boolean;
}

export type TokenExporter = (tokens: TokenGroup, options?: ExportOptions) => Result<string, string>;
