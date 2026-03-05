import type { ComponentSpec } from "grimorio-core";
import type { AnalyzedComponent } from "grimorio-analyzers";
import type { ValidationLevel, ValidationIssue } from "./types.js";

const KEYBOARD_HANDLER_NAMES = new Set(["onKeyDown", "onKeyUp", "onKeyPress"]);

export function validateAccessibility(
  analysis: AnalyzedComponent,
  spec: ComponentSpec,
  level: ValidationLevel = "standard",
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const a11y = spec.accessibility;

  if (!a11y) return issues;

  // Check role (basic+)
  if (a11y.role) {
    const hasRole = analysis.accessibilityAttrs.some(
      (attr) => attr.name === "role" && attr.value === a11y.role,
    );
    if (!hasRole) {
      issues.push({
        code: "MISSING_ROLE",
        severity: "error",
        message: `Expected role="${a11y.role}" but not found`,
        expected: a11y.role,
      });
    }
  }

  // Check aria attributes (standard+)
  if (level === "standard" || level === "strict") {
    for (const expectedAttr of a11y.ariaAttributes) {
      const found = analysis.accessibilityAttrs.some((attr) => attr.name === expectedAttr);
      if (!found) {
        issues.push({
          code: "MISSING_ARIA_ATTR",
          severity: "warning",
          message: `Expected aria attribute "${expectedAttr}" not found`,
          expected: expectedAttr,
        });
      }
    }

    // Check at least one keyboard handler exists
    const hasKeyboardHandler = analysis.accessibilityAttrs.some((attr) =>
      KEYBOARD_HANDLER_NAMES.has(attr.name),
    );
    if (a11y.keyboardInteractions.length > 0 && !hasKeyboardHandler) {
      issues.push({
        code: "MISSING_KEYBOARD_HANDLER",
        severity: "warning",
        message: "Component has keyboard interactions in spec but no keyboard event handlers",
      });
    }
  }

  // Check all keyboard interactions (strict)
  if (level === "strict") {
    const hasKeyboardHandler = analysis.accessibilityAttrs.some((attr) =>
      KEYBOARD_HANDLER_NAMES.has(attr.name),
    );

    for (const interaction of a11y.keyboardInteractions) {
      // We can only check that handlers exist, not specific key handling
      if (!hasKeyboardHandler) {
        issues.push({
          code: "MISSING_KEYBOARD_HANDLER",
          severity: "error",
          message: `No keyboard handler for interaction: ${interaction.key} - ${interaction.description}`,
          expected: interaction.key,
        });
      }
    }

    // Check interactive elements have keyboard support
    const isInteractive = analysis.accessibilityAttrs.some(
      (attr) =>
        attr.name === "role" &&
        ["button", "link", "checkbox", "radio", "tab", "menuitem", "switch"].includes(
          attr.value ?? "",
        ),
    );
    if (isInteractive && !hasKeyboardHandler) {
      issues.push({
        code: "INTERACTIVE_WITHOUT_KEYBOARD",
        severity: "error",
        message: "Interactive component has no keyboard event handlers",
      });
    }
  }

  return issues;
}
