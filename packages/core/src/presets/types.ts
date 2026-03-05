import type { ComponentSpec } from "../schemas/component-spec.js";

/**
 * A ComponentPreset is a ComponentSpec without the `name` field.
 * The name is injected when the preset is applied.
 */
export type ComponentPreset = Omit<ComponentSpec, "name">;
