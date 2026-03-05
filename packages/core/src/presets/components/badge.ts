import type { ComponentPreset } from "../types.js";

export const badgePreset: ComponentPreset = {
  description: "A small label for status, counts, or categories",
  category: "data-display",
  complexity: "simple",
  props: [
    { name: "children", type: "ReactNode", required: true, description: "Badge content" },
    { name: "variant", type: "string", required: false, description: "Visual variant" },
  ],
  variants: [
    {
      name: "variant",
      values: ["default", "primary", "secondary", "success", "warning", "destructive", "outline"],
      description: "Badge style",
    },
    { name: "size", values: ["sm", "md"], description: "Badge size" },
  ],
  defaultVariants: { variant: "default", size: "md" },
  slots: [],
  anatomy: [{ name: "root", description: "Badge container", required: true }],
  tokenMapping: {
    "root.background[variant=default]": "{color.secondary}",
    "root.background[variant=primary]": "{color.primary}",
    "root.background[variant=secondary]": "{color.secondary}",
    "root.background[variant=success]": "{color.success}",
    "root.background[variant=warning]": "{color.warning}",
    "root.background[variant=destructive]": "{color.destructive}",
    "root.background[variant=outline]": "{color.transparent}",
    "root.borderColor[variant=outline]": "{color.border}",
    "root.color[variant=default]": "{color.secondary.foreground}",
    "root.color[variant=primary]": "{color.primary.foreground}",
    "root.color[variant=destructive]": "{color.destructive.foreground}",
    "root.borderRadius": "{borderRadius.full}",
    "root.paddingInline[size=sm]": "{spacing.xs}",
    "root.paddingInline[size=md]": "{spacing.sm}",
    "root.fontFamily": "{fontFamily.sans}",
    "root.fontSize[size=sm]": "{fontSize.xs}",
    "root.fontSize[size=md]": "{fontSize.sm}",
  },
  states: [],
  events: [],
  dependencies: [],
  accessibility: {
    ariaAttributes: ["aria-label"],
    keyboardInteractions: [],
  },
  guidelines: [
    "Keep badge text short and concise",
    "Use semantic colors to convey meaning (success=green, destructive=red)",
    "Do not rely on color alone to convey information",
  ],
};
