import type { ComponentSpec, TokenGroup } from "grimorio-core";
import type { AnalyzedComponent } from "grimorio-analyzers";
import type { ValidationLevel, ValidationResult } from "./types.js";
import { validateStructure } from "./validate-structure.js";
import { validateTokens } from "./validate-tokens.js";
import { validateAccessibility } from "./validate-accessibility.js";

export function validate(
  analysis: AnalyzedComponent,
  spec: ComponentSpec,
  tokens?: TokenGroup,
  level: ValidationLevel = "standard",
): ValidationResult {
  const issues = [
    ...validateStructure(analysis, spec, level),
    ...validateTokens(analysis, spec, tokens, level),
    ...validateAccessibility(analysis, spec, level),
  ];

  const hasErrors = issues.some((i) => i.severity === "error");

  return {
    valid: !hasErrors,
    issues,
    componentName: spec.name,
    level,
  };
}
