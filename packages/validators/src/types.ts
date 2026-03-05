export type ValidationLevel = "basic" | "standard" | "strict";

export type IssueSeverity = "error" | "warning" | "info";

export type IssueCode =
  // Structure
  | "MISSING_PROP"
  | "EXTRA_PROP"
  | "MISSING_VARIANT"
  | "EXTRA_VARIANT"
  | "MISSING_ANATOMY_PART"
  // Tokens
  | "HARDCODED_VALUE"
  | "NON_TOKENIZED_CLASS"
  | "MISSING_TOKEN"
  // Accessibility
  | "MISSING_ROLE"
  | "MISSING_ARIA_ATTR"
  | "MISSING_KEYBOARD_HANDLER"
  | "INTERACTIVE_WITHOUT_KEYBOARD";

export interface ValidationIssue {
  code: IssueCode;
  severity: IssueSeverity;
  message: string;
  expected?: string;
  actual?: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
  componentName: string;
  level: ValidationLevel;
}
