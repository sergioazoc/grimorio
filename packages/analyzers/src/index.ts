export type {
  AnalyzedComponent,
  AnalyzedProp,
  AnalyzedVariant,
  AccessibilityAttr,
  ImportInfo,
  ExportInfo,
  TailwindClass,
} from "./types.js";

export { analyzeReactFile } from "./react/analyze-react.js";
export { analyzeVueFile } from "./vue/analyze-vue.js";
export { extractVariants } from "./react/extract-variants.js";
export { resolveImport } from "./resolver.js";
