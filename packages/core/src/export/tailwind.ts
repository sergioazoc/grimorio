import type { TokenGroup } from "../schemas/design-tokens.js";
import type { TokenExporter } from "./types.js";
import { ok } from "../result.js";
import { flattenWithTypes, formatTokenValue, escapeJsString } from "./utils.js";

const categoryToThemeKey: Record<string, string> = {
  color: "colors",
  spacing: "spacing",
  fontSize: "fontSize",
  fontFamily: "fontFamily",
  fontWeight: "fontWeight",
  lineHeight: "lineHeight",
  letterSpacing: "letterSpacing",
  borderRadius: "borderRadius",
  shadow: "boxShadow",
  opacity: "opacity",
  zIndex: "zIndex",
  duration: "transitionDuration",
  easing: "transitionTimingFunction",
};

export const exportTailwind: TokenExporter = (tokens: TokenGroup, _options = {}) => {
  const flat = flattenWithTypes(tokens);
  const theme: Record<string, Record<string, string>> = {};

  for (const [path, token] of flat) {
    const segments = path.split(".");
    const category = segments[0];
    const key = segments.slice(1).join("-");
    const themeKey = categoryToThemeKey[category] ?? category;

    if (!theme[themeKey]) theme[themeKey] = {};
    theme[themeKey][key] = formatTokenValue(token.$value);
  }

  const lines: string[] = ["export default {", "  theme: {", "    extend: {"];

  const keys = Object.keys(theme).sort();
  for (let i = 0; i < keys.length; i++) {
    const themeKey = keys[i];
    const entries = theme[themeKey];
    lines.push(`      ${themeKey}: {`);
    const entryKeys = Object.keys(entries);
    for (let j = 0; j < entryKeys.length; j++) {
      const k = entryKeys[j];
      const needsQuotes = /[^a-zA-Z0-9_$]/.test(k);
      const keyStr = needsQuotes ? `"${k}"` : k;
      lines.push(`        ${keyStr}: "${escapeJsString(entries[k])}",`);
    }
    lines.push("      },");
  }

  lines.push("    },");
  lines.push("  },");
  lines.push("};");

  return ok(lines.join("\n") + "\n");
};
