import { z } from "zod";

export const PropSchema = z.object({
  name: z.string(),
  type: z.string(),
  required: z.boolean().default(false),
  default: z.unknown().optional(),
  description: z.string().optional(),
});

export const VariantSchema = z.object({
  name: z.string(),
  values: z.array(z.string()),
  description: z.string().optional(),
});

export const SlotSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  required: z.boolean().default(false),
});

export const AnatomyPartSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  required: z.boolean().default(true),
});

export const EventSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
});

export const AccessibilitySchema = z.object({
  role: z.string().optional(),
  ariaAttributes: z.array(z.string()).default([]),
  keyboardInteractions: z
    .array(
      z.object({
        key: z.string(),
        description: z.string(),
      }),
    )
    .default([]),
});

export const ComponentSpecSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  complexity: z.enum(["simple", "moderate", "complex"]).default("moderate"),
  props: z.array(PropSchema).default([]),
  variants: z.array(VariantSchema).default([]),
  defaultVariants: z.record(z.string(), z.string()).default({}),
  slots: z.array(SlotSchema).default([]),
  anatomy: z.array(AnatomyPartSchema).default([]),
  tokenMapping: z.record(z.string(), z.string()).default({}),
  states: z.array(z.string()).default([]),
  events: z.array(EventSchema).default([]),
  dependencies: z.array(z.string()).default([]),
  accessibility: AccessibilitySchema.optional(),
  guidelines: z.array(z.string()).default([]),
});

export type Prop = z.infer<typeof PropSchema>;
export type Variant = z.infer<typeof VariantSchema>;
export type Slot = z.infer<typeof SlotSchema>;
export type AnatomyPart = z.infer<typeof AnatomyPartSchema>;
export type Event = z.infer<typeof EventSchema>;
export type Accessibility = z.infer<typeof AccessibilitySchema>;
export type ComponentSpec = z.infer<typeof ComponentSpecSchema>;
