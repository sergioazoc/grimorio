import type { ComponentPreset } from "../types.js";

export const avatarPreset: ComponentPreset = {
  description: "A visual representation of a user or entity",
  category: "data-display",
  complexity: "simple",
  props: [
    { name: "src", type: "string", required: false, description: "Image URL" },
    { name: "alt", type: "string", required: true, description: "Accessible alt text" },
    {
      name: "fallback",
      type: "string",
      required: false,
      description: "Fallback text (initials) when image is unavailable",
    },
    { name: "size", type: "string", required: false, default: "md", description: "Avatar size" },
  ],
  variants: [
    { name: "size", values: ["xs", "sm", "md", "lg", "xl"], description: "Avatar size" },
    { name: "shape", values: ["circle", "square"], description: "Avatar shape" },
  ],
  defaultVariants: { size: "md", shape: "circle" },
  slots: [],
  anatomy: [
    { name: "root", description: "Avatar container", required: true },
    { name: "image", description: "Avatar image element", required: false },
    { name: "fallback", description: "Fallback content (initials or icon)", required: true },
  ],
  tokenMapping: {
    "root.background": "{color.muted}",
    "root.borderRadius[shape=circle]": "{borderRadius.full}",
    "root.borderRadius[shape=square]": "{borderRadius.md}",
    "fallback.color": "{color.muted.foreground}",
    "fallback.fontFamily": "{fontFamily.sans}",
    "fallback.fontSize[size=xs]": "{fontSize.xs}",
    "fallback.fontSize[size=sm]": "{fontSize.sm}",
    "fallback.fontSize[size=md]": "{fontSize.base}",
    "fallback.fontSize[size=lg]": "{fontSize.lg}",
    "fallback.fontSize[size=xl]": "{fontSize.xl}",
  },
  states: [],
  events: [],
  dependencies: [],
  accessibility: {
    role: "img",
    ariaAttributes: ["aria-label"],
    keyboardInteractions: [],
  },
  guidelines: [
    "Always provide meaningful alt text",
    "Show initials as fallback when the image fails to load",
    "Use consistent sizes across the application",
  ],
};
