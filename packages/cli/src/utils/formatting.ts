import consola from "consola";
import type { ValidationResult } from "grimorio-validators";

export function formatResults(results: ValidationResult[]): void {
  if (results.length === 0) {
    consola.info("No components matched any specs.");
    return;
  }

  let totalIssues = 0;

  for (const result of results) {
    if (result.issues.length === 0) {
      consola.success(`${result.componentName}: OK`);
      continue;
    }

    totalIssues += result.issues.length;

    const icon = result.valid ? "⚠" : "✗";
    consola.log(`\n${icon} ${result.componentName}`);

    for (const issue of result.issues) {
      const prefix =
        issue.severity === "error" ? "  ✗" : issue.severity === "warning" ? "  ⚠" : "  ℹ";

      consola.log(`${prefix} [${issue.code}] ${issue.message}`);
    }
  }

  const passed = results.filter((r) => r.valid).length;
  const failed = results.filter((r) => !r.valid).length;

  consola.log(`\n${passed} passed, ${failed} failed, ${totalIssues} issues total`);
}
