import type { ComponentSpec } from "grimorio-core";
import type { AnalyzedComponent } from "grimorio-analyzers";
import type { ValidationLevel, ValidationIssue } from "./types.js";

export function validateStructure(
  analysis: AnalyzedComponent,
  spec: ComponentSpec,
  level: ValidationLevel = "standard",
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check required props (basic+)
  for (const specProp of spec.props) {
    if (specProp.required) {
      const found = analysis.props.find((p) => p.name === specProp.name);
      if (!found) {
        issues.push({
          code: "MISSING_PROP",
          severity: "error",
          message: `Required prop "${specProp.name}" is missing`,
          expected: specProp.name,
        });
      }
    }
  }

  // Check variants (standard+)
  if (level === "standard" || level === "strict") {
    for (const specVariant of spec.variants) {
      const found = analysis.variants.find((v) => v.name === specVariant.name);
      if (!found) {
        issues.push({
          code: "MISSING_VARIANT",
          severity: "warning",
          message: `Variant "${specVariant.name}" is missing`,
          expected: specVariant.name,
        });
      } else {
        // Check variant values
        for (const val of specVariant.values) {
          if (!found.values.includes(val)) {
            issues.push({
              code: "MISSING_VARIANT",
              severity: "warning",
              message: `Variant "${specVariant.name}" is missing value "${val}"`,
              expected: val,
              actual: found.values.join(", "),
            });
          }
        }
      }
    }
  }

  // Check extra props and extra variants (strict only)
  if (level === "strict") {
    for (const prop of analysis.props) {
      const inSpec = spec.props.find((p) => p.name === prop.name);
      if (!inSpec) {
        issues.push({
          code: "EXTRA_PROP",
          severity: "info",
          message: `Prop "${prop.name}" exists in implementation but not in spec`,
          actual: prop.name,
        });
      }
    }

    for (const variant of analysis.variants) {
      const inSpec = spec.variants.find((v) => v.name === variant.name);
      if (!inSpec) {
        issues.push({
          code: "EXTRA_VARIANT",
          severity: "info",
          message: `Variant "${variant.name}" exists in implementation but not in spec`,
          actual: variant.name,
        });
      }
    }

    // Check anatomy parts (compound components)
    for (const part of spec.anatomy) {
      // Anatomy parts would need to be detected by naming convention (e.g., Component.Part)
      // For now, we just flag that anatomy parts are expected
      if (part.required) {
        issues.push({
          code: "MISSING_ANATOMY_PART",
          severity: "warning",
          message: `Expected anatomy part "${part.name}" not verified`,
          expected: part.name,
        });
      }
    }
  }

  return issues;
}
