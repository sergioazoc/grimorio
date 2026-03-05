import type { ComponentPreset } from "../types.js";

export const dialogPreset: ComponentPreset = {
  description: "A modal dialog overlay that requires user interaction",
  category: "feedback",
  complexity: "complex",
  props: [
    { name: "open", type: "boolean", required: true, description: "Whether the dialog is open" },
    { name: "title", type: "string", required: true, description: "Dialog title" },
    {
      name: "description",
      type: "string",
      required: false,
      description: "Optional description below the title",
    },
    { name: "children", type: "ReactNode", required: true, description: "Dialog body content" },
    {
      name: "modal",
      type: "boolean",
      required: false,
      default: true,
      description: "Whether the dialog is modal (blocks background interaction)",
    },
  ],
  variants: [{ name: "size", values: ["sm", "md", "lg", "full"], description: "Dialog width" }],
  defaultVariants: { size: "md" },
  slots: [
    { name: "header", description: "Custom header content", required: false },
    { name: "footer", description: "Footer with action buttons", required: false },
  ],
  anatomy: [
    { name: "overlay", description: "Background overlay", required: true },
    { name: "content", description: "Dialog content container", required: true },
    { name: "header", description: "Header area with title", required: true },
    { name: "body", description: "Main content area", required: true },
    { name: "footer", description: "Footer area with actions", required: false },
    { name: "close", description: "Close button", required: false },
  ],
  tokenMapping: {
    "overlay.background": "{color.overlay}",
    "content.background": "{color.background}",
    "content.borderRadius": "{borderRadius.lg}",
    "content.shadow": "{shadow.lg}",
    "content.padding": "{spacing.lg}",
    "header.fontFamily": "{fontFamily.sans}",
    "header.fontSize": "{fontSize.lg}",
    "header.color": "{color.foreground}",
    "body.color": "{color.muted.foreground}",
    "body.fontFamily": "{fontFamily.sans}",
  },
  states: ["open", "closing"],
  events: [
    { name: "onClose", description: "Fired when the dialog is dismissed" },
    { name: "onOpenChange", description: "Fired when the open state changes" },
  ],
  dependencies: [],
  accessibility: {
    role: "dialog",
    ariaAttributes: ["aria-modal", "aria-labelledby", "aria-describedby"],
    keyboardInteractions: [
      { key: "Escape", description: "Closes the dialog" },
      { key: "Tab", description: "Cycles focus within the dialog (focus trap)" },
    ],
  },
  guidelines: [
    "Always trap focus inside the dialog when open",
    "Return focus to the trigger element when the dialog closes",
    "Provide a clear way to dismiss the dialog (close button or Escape key)",
    "Use sparingly — prefer inline content when possible",
  ],
};
