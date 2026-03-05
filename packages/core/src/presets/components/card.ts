import type { ComponentPreset } from "../types.js";

export const cardPreset: ComponentPreset = {
  description: "A container for grouping related content",
  category: "layout",
  complexity: "simple",
  props: [
    { name: "children", type: "ReactNode", required: true, description: "Card content" },
    { name: "variant", type: "string", required: false, description: "Visual variant" },
    {
      name: "padding",
      type: "string",
      required: false,
      default: "md",
      description: "Internal padding",
    },
    {
      name: "as",
      type: "string",
      required: false,
      default: "div",
      description: "HTML element to render as",
    },
  ],
  variants: [
    { name: "variant", values: ["default", "outlined", "elevated"], description: "Card style" },
    { name: "padding", values: ["none", "sm", "md", "lg"], description: "Internal padding" },
  ],
  defaultVariants: { variant: "default", padding: "md" },
  slots: [
    { name: "header", description: "Card header area", required: false },
    { name: "footer", description: "Card footer area", required: false },
    { name: "media", description: "Card media/image area", required: false },
  ],
  anatomy: [
    { name: "root", description: "Card container", required: true },
    { name: "header", description: "Header area", required: false },
    { name: "body", description: "Main content area", required: true },
    { name: "footer", description: "Footer area", required: false },
    { name: "media", description: "Media/image area", required: false },
  ],
  tokenMapping: {
    "root.background": "{color.card}",
    "root.background[variant=elevated]": "{color.card}",
    "root.borderColor[variant=outlined]": "{color.border}",
    "root.borderRadius": "{borderRadius.lg}",
    "root.shadow[variant=elevated]": "{shadow.md}",
    "root.padding[padding=sm]": "{spacing.sm}",
    "root.padding[padding=md]": "{spacing.md}",
    "root.padding[padding=lg]": "{spacing.lg}",
    "header.fontFamily": "{fontFamily.sans}",
    "header.color": "{color.foreground}",
  },
  states: [],
  events: [],
  dependencies: [],
  accessibility: {
    ariaAttributes: [],
    keyboardInteractions: [],
  },
  guidelines: [
    "Use cards to group related content visually",
    "Keep card content concise and scannable",
    "If the card is clickable, use a semantic element (a or button) as the root",
  ],
};
