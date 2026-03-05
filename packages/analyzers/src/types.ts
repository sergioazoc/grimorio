export interface AnalyzedProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
}

export interface AnalyzedVariant {
  name: string;
  values: string[];
}

export interface AccessibilityAttr {
  name: string;
  value?: string;
}

export interface ImportInfo {
  source: string;
  specifiers: string[];
  isDefault: boolean;
}

export interface ExportInfo {
  name: string;
  isDefault: boolean;
}

export interface TailwindClass {
  className: string;
  location?: { line: number; column: number };
}

export interface AnalyzedComponent {
  name: string;
  filePath: string;
  framework: "react" | "vue";
  props: AnalyzedProp[];
  variants: AnalyzedVariant[];
  tailwindClasses: string[];
  accessibilityAttrs: AccessibilityAttr[];
  imports: ImportInfo[];
  exports: ExportInfo[];
}
