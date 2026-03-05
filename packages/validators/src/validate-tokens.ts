import type { ComponentSpec, TokenGroup } from "grimorio-core";
import { resolveTokenReference } from "grimorio-core";
import type { AnalyzedComponent } from "grimorio-analyzers";
import type { ValidationLevel, ValidationIssue } from "./types.js";

// Regex patterns for hardcoded values in Tailwind classes
const HARDCODED_PATTERNS = [
  /bg-\[#[0-9a-fA-F]+\]/, // bg-[#ff0000]
  /text-\[#[0-9a-fA-F]+\]/, // text-[#ff0000]
  /border-\[#[0-9a-fA-F]+\]/,
  /bg-\[rgb/,
  /text-\[rgb/,
  /\[(\d+)px\]/, // arbitrary pixel values
  /\[(\d+)rem\]/, // arbitrary rem values
];

export function validateTokens(
  analysis: AnalyzedComponent,
  spec: ComponentSpec,
  tokens?: TokenGroup,
  level: ValidationLevel = "standard",
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (level === "basic") return issues;

  // Check for hardcoded values in tailwind classes (standard+)
  for (const cls of analysis.tailwindClasses) {
    for (const pattern of HARDCODED_PATTERNS) {
      if (pattern.test(cls)) {
        issues.push({
          code: "HARDCODED_VALUE",
          severity: "warning",
          message: `Hardcoded value found in class "${cls}". Consider using a design token.`,
          actual: cls,
        });
        break;
      }
    }
  }

  // Check that spec tokenMapping references resolve (strict)
  if (level === "strict" && tokens) {
    const seen = new Set<string>();
    for (const [key, ref] of Object.entries(spec.tokenMapping)) {
      // Extract token path from {token.path} reference format
      const tokenPath = ref.replace(/^\{|\}$/g, "");
      if (seen.has(tokenPath)) continue;
      seen.add(tokenPath);
      const result = resolveTokenReference(tokenPath, tokens);
      if (!result.ok) {
        issues.push({
          code: "MISSING_TOKEN",
          severity: "error",
          message: `Token "${tokenPath}" referenced in tokenMapping key "${key}" does not exist`,
          expected: tokenPath,
        });
      }
    }
  }

  return issues;
}
