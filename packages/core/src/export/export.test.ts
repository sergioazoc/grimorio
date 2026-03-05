import { describe, it, expect } from "vitest";
import type { TokenGroup } from "../schemas/design-tokens.js";
import { exportCss, exportCssThemed } from "./css.js";
import { exportScss } from "./scss.js";
import { exportJs } from "./js.js";
import { exportTailwind } from "./tailwind.js";
import { exportTokens } from "./index.js";
import {
  formatTokenValue,
  flattenWithTypes,
  escapeJsString,
  escapeCssComment,
  escapeScssComment,
} from "./utils.js";

const sampleTokens: TokenGroup = {
  color: {
    $type: "color",
    primary: { $value: "#3b82f6", $description: "Primary brand color" },
    secondary: { $value: "#64748b" },
  },
  spacing: {
    $type: "dimension",
    sm: { $value: "0.5rem" },
  },
  shadow: {
    $type: "shadow",
    md: {
      $value: {
        offsetX: "0px",
        offsetY: "4px",
        blur: "6px",
        spread: "-1px",
        color: "rgba(0,0,0,0.1)",
      },
    },
  },
  easing: {
    $type: "cubicBezier",
    "in-out": { $value: [0.4, 0, 0.2, 1] },
  },
};

describe("exportCss", () => {
  it("should generate CSS custom properties in :root", () => {
    const result = exportCss(sampleTokens);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toContain(":root {");
    expect(result.value).toContain("--color-primary: #3b82f6;");
    expect(result.value).toContain("--spacing-sm: 0.5rem;");
    expect(result.value).toContain("}");
  });

  it("should include descriptions as comments by default", () => {
    const result = exportCss(sampleTokens);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toContain("/* Primary brand color */");
  });

  it("should omit descriptions when disabled", () => {
    const result = exportCss(sampleTokens, { includeDescriptions: false });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).not.toContain("/*");
  });

  it("should respect prefix", () => {
    const result = exportCss(sampleTokens, { prefix: "ds" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toContain("--ds-color-primary: #3b82f6;");
  });
});

describe("exportScss", () => {
  it("should generate SCSS variables", () => {
    const result = exportScss(sampleTokens);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toContain("$color-primary: #3b82f6;");
    expect(result.value).toContain("$spacing-sm: 0.5rem;");
  });

  it("should include descriptions as comments", () => {
    const result = exportScss(sampleTokens);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toContain("// Primary brand color");
  });

  it("should respect prefix", () => {
    const result = exportScss(sampleTokens, { prefix: "ds" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toContain("$ds-color-primary: #3b82f6;");
  });
});

describe("exportJs", () => {
  it("should generate JS exports", () => {
    const result = exportJs(sampleTokens);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toContain('export const colorPrimary = "#3b82f6";');
    expect(result.value).toContain('export const spacingSm = "0.5rem";');
  });

  it("should include descriptions as JSDoc comments", () => {
    const result = exportJs(sampleTokens);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toContain("/** Primary brand color */");
  });
});

describe("exportTailwind", () => {
  it("should generate Tailwind theme config with extend", () => {
    const result = exportTailwind(sampleTokens);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toContain("export default {");
    expect(result.value).toContain("theme: {");
    expect(result.value).toContain("extend: {");
    expect(result.value).toContain("colors: {");
    expect(result.value).toContain('primary: "#3b82f6",');
  });

  it("should map category names to Tailwind theme keys", () => {
    const result = exportTailwind(sampleTokens);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toContain("boxShadow: {");
    expect(result.value).toContain("transitionTimingFunction: {");
  });
});

describe("exportTokens dispatch", () => {
  it("should dispatch to the correct exporter", () => {
    const css = exportTokens(sampleTokens, "css");
    expect(css.ok).toBe(true);
    if (css.ok) expect(css.value).toContain(":root {");

    const scss = exportTokens(sampleTokens, "scss");
    expect(scss.ok).toBe(true);
    if (scss.ok) expect(scss.value).toContain("$color-primary");
  });

  it("should return error for unknown format", () => {
    const result = exportTokens(sampleTokens, "yaml");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("Unknown export format");
  });
});

describe("formatTokenValue", () => {
  it("should serialize shadow as CSS string", () => {
    const val = formatTokenValue({
      offsetX: "0px",
      offsetY: "4px",
      blur: "6px",
      spread: "-1px",
      color: "rgba(0,0,0,0.1)",
    });
    expect(val).toBe("0px 4px 6px -1px rgba(0,0,0,0.1)");
  });

  it("should serialize cubicBezier as cubic-bezier()", () => {
    const val = formatTokenValue([0.4, 0, 0.2, 1]);
    expect(val).toBe("cubic-bezier(0.4, 0, 0.2, 1)");
  });

  it("should pass through strings", () => {
    expect(formatTokenValue("#fff")).toBe("#fff");
  });

  it("should convert numbers to string", () => {
    expect(formatTokenValue(400)).toBe("400");
  });
});

describe("exportCssThemed", () => {
  it("should generate :root for default theme", () => {
    const themes = new Map<string, TokenGroup>([
      ["default", { color: { $type: "color", primary: { $value: "#3b82f6" } } }],
    ]);
    const result = exportCssThemed(themes);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toContain(":root {");
    expect(result.value).toContain("--color-primary: #3b82f6;");
  });

  it("should generate data-theme selector for non-default themes", () => {
    const themes = new Map<string, TokenGroup>([
      ["default", { color: { $type: "color", primary: { $value: "#3b82f6" } } }],
      ["dark", { color: { $type: "color", primary: { $value: "#1e40af" } } }],
    ]);
    const result = exportCssThemed(themes);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toContain(":root {");
    expect(result.value).toContain('[data-theme="dark"] {');
    expect(result.value).toContain("--color-primary: #3b82f6;");
    expect(result.value).toContain("--color-primary: #1e40af;");
  });

  it("should respect prefix option", () => {
    const themes = new Map<string, TokenGroup>([
      ["default", { color: { $type: "color", primary: { $value: "#fff" } } }],
    ]);
    const result = exportCssThemed(themes, { prefix: "ds" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toContain("--ds-color-primary: #fff;");
  });
});

describe("security: escape functions", () => {
  it("escapeJsString should escape double quotes", () => {
    expect(escapeJsString('hello"world')).toBe('hello\\"world');
  });

  it("escapeJsString should escape backslashes", () => {
    expect(escapeJsString("path\\to")).toBe("path\\\\to");
  });

  it("escapeJsString should escape newlines", () => {
    expect(escapeJsString("line1\nline2")).toBe("line1\\nline2");
  });

  it("escapeCssComment should neutralize comment close", () => {
    expect(escapeCssComment("break */ out")).toBe("break * / out");
  });

  it("escapeScssComment should strip newlines", () => {
    expect(escapeScssComment("line1\nline2\rline3")).toBe("line1 line2 line3");
  });
});

describe("security: JS exporter prevents injection", () => {
  it("should escape quotes in token values so they stay inside the string literal", () => {
    const malicious: TokenGroup = {
      test: { $type: "color", evil: { $value: '"; process.exit(1); //' } },
    };
    const result = exportJs(malicious);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // The escaped \" keeps the malicious payload inside the string literal
    expect(result.value).toContain('\\"');
    // The value assignment is on a single line, properly enclosed in quotes
    const jsLines = result.value.split("\n").filter((l: string) => l.includes("testEvil"));
    expect(jsLines).toHaveLength(1);
    expect(jsLines[0]).toMatch(/^export const testEvil = ".*";$/);
  });

  it("should escape comment-close in descriptions", () => {
    const malicious: TokenGroup = {
      test: { $type: "color", evil: { $value: "#000", $description: "break */ out" } },
    };
    const result = exportJs(malicious);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // The literal sequence "*/" from the description should be neutralized
    expect(result.value).toContain("break * / out");
  });
});

describe("security: CSS exporter prevents injection", () => {
  it("should escape comment-close in descriptions", () => {
    const malicious: TokenGroup = {
      test: {
        $type: "color",
        evil: { $value: "#000", $description: "*/ body{display:none} /*" },
      },
    };
    const result = exportCss(malicious);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // The */ in the description is neutralized to * /, so the comment never closes prematurely
    expect(result.value).toContain("* / body");
    // No raw */ from the description that would let injected CSS escape the comment
    expect(result.value).not.toMatch(/\*\/\s*body\{display:none\}/);
  });
});

describe("formatTokenValue: composite types", () => {
  it("should serialize border as CSS shorthand", () => {
    const val = formatTokenValue({ width: "1px", style: "solid", color: "#000" });
    expect(val).toBe("1px solid #000");
  });

  it("should serialize transition as CSS shorthand", () => {
    const val = formatTokenValue({
      property: "opacity",
      duration: "200ms",
      timingFunction: "ease-in-out",
      delay: "0ms",
    });
    expect(val).toBe("opacity 200ms ease-in-out 0ms");
  });

  it("should default transition property to all", () => {
    const val = formatTokenValue({ duration: "200ms", timingFunction: "ease" });
    expect(val).toBe("all 200ms ease");
  });

  it("should serialize gradient as CSS function", () => {
    const val = formatTokenValue({
      type: "linear",
      stops: [
        { color: "#000", position: "0%" },
        { color: "#fff", position: "100%" },
      ],
    });
    expect(val).toBe("linear-gradient(#000 0%, #fff 100%)");
  });

  it("should serialize strokeStyle dashArray", () => {
    const val = formatTokenValue({ dashArray: [3, 2, 1], lineCap: "round" });
    expect(val).toBe("3 2 1");
  });

  it("should JSON.stringify typography (no useful CSS shorthand)", () => {
    const val = formatTokenValue({ fontFamily: "Inter", fontSize: "16px" });
    expect(val).toBe(JSON.stringify({ fontFamily: "Inter", fontSize: "16px" }));
  });
});

describe("flattenWithTypes: token references", () => {
  it("should resolve simple token reference", () => {
    const tokens: TokenGroup = {
      color: {
        $type: "color",
        base: { $value: "#3b82f6" },
        alias: { $value: "{color.base}" },
      },
    };
    const flat = flattenWithTypes(tokens);
    expect(flat.get("color.alias")?.$value).toBe("#3b82f6");
  });

  it("should resolve chained token references", () => {
    const tokens: TokenGroup = {
      color: {
        $type: "color",
        base: { $value: "#3b82f6" },
        alias: { $value: "{color.base}" },
        alias2: { $value: "{color.alias}" },
      },
    };
    const flat = flattenWithTypes(tokens);
    expect(flat.get("color.alias2")?.$value).toBe("#3b82f6");
  });

  it("should not crash on circular references", () => {
    const tokens: TokenGroup = {
      color: {
        $type: "color",
        a: { $value: "{color.b}" },
        b: { $value: "{color.a}" },
      },
    };
    const flat = flattenWithTypes(tokens);
    // Should not crash — value stays as unresolved reference
    expect(flat.get("color.a")).toBeDefined();
    expect(flat.get("color.b")).toBeDefined();
  });

  it("should preserve reference string when resolveReferences is false", () => {
    const tokens: TokenGroup = {
      color: {
        $type: "color",
        base: { $value: "#3b82f6" },
        alias: { $value: "{color.base}" },
      },
    };
    const flat = flattenWithTypes(tokens, { resolveReferences: false });
    expect(flat.get("color.alias")?.$value).toBe("{color.base}");
  });

  it("should leave unresolvable references as-is", () => {
    const tokens: TokenGroup = {
      color: {
        $type: "color",
        alias: { $value: "{color.nonexistent}" },
      },
    };
    const flat = flattenWithTypes(tokens);
    expect(flat.get("color.alias")?.$value).toBe("{color.nonexistent}");
  });
});

describe("security: Tailwind exporter prevents injection", () => {
  it("should escape quotes in token values", () => {
    const malicious: TokenGroup = {
      color: { $type: "color", evil: { $value: '"; require("child_process")' } },
    };
    const result = exportTailwind(malicious);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // Quotes inside values should be escaped
    expect(result.value).toContain('\\"');
    // The value assignment is on a single line, properly enclosed in quotes
    const twLines = result.value.split("\n").filter((l: string) => l.includes("evil"));
    expect(twLines).toHaveLength(1);
    expect(twLines[0].trim()).toMatch(/^evil: ".*",$/);
  });
});
